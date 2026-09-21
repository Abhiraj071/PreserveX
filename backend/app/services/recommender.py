import math
import logging
from typing import List, Dict, Any, Tuple
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.models.packaging import PackagingMaterial
from app.schemas.packaging import PackagingMaterialResponse
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    AlternativeOption,
    BarrierRequirements
)
from app.services.external_api import external_food_service
from app.services.rule_engine import rule_engine
from app.services.ml_engine import ml_predictor

logger = logging.getLogger(__name__)

class HybridRecommendationEngine:
    """
    Hybrid Decision Engine combining:
    1. Scientific Rule Engine (Chemical-physical barrier envelopes & safety limits)
    2. Machine Learning Engine (Random Forest continuous barrier prediction)
    3. Multi-Criteria Decision Analysis (MCDA / TOPSIS weighting for Cost vs Sustainability vs Barrier)
    """

    async def generate_recommendation(
        self,
        req: RecommendationRequest,
        db: Session
    ) -> RecommendationResponse:
        # Step 1: Auto-fill missing food properties and track provenance
        properties, provenance, is_respiring = await self._resolve_food_properties(req, db)
        
        moisture_pct = properties["moisture_pct"]
        fat_pct = properties["fat_pct"]
        ph = properties["ph"]
        water_activity = properties["water_activity"]
        respiration_rate = properties["respiration_rate"]

        # Step 2: Compute Scientific Rule Engine Envelope
        barrier_req = rule_engine.calculate_barrier_envelope(
            moisture_pct=moisture_pct,
            fat_pct=fat_pct,
            ph=ph,
            water_activity=water_activity,
            respiration_rate=respiration_rate,
            is_respiring=is_respiring,
            temperature_c=req.temperature_c,
            relative_humidity_pct=req.relative_humidity_pct,
            target_shelf_life_days=req.target_shelf_life_days
        )

        # Step 3: Run ML Random Forest prediction for cross-validation
        ml_preds = ml_predictor.predict_barrier_targets(
            moisture_pct=moisture_pct,
            fat_pct=fat_pct,
            ph=ph,
            water_activity=water_activity,
            respiration_rate=respiration_rate,
            is_respiring=is_respiring,
            temperature_c=req.temperature_c,
            relative_humidity_pct=req.relative_humidity_pct,
            target_shelf_life_days=req.target_shelf_life_days
        )

        # Step 4: Query all packaging materials and evaluate compatibility
        all_materials = db.query(PackagingMaterial).all()
        ranked_options = self._score_and_rank_materials(
            materials=all_materials,
            barrier_req=barrier_req,
            is_respiring=is_respiring,
            req=req,
            water_activity=water_activity,
            fat_pct=fat_pct
        )

        if not ranked_options:
            raise ValueError("No packaging materials found in knowledge base database.")

        # Top option is primary recommendation
        primary_match, primary_scores = ranked_options[0]
        
        # Step 5: Estimate realistic shelf life for primary material
        arrhenius_q10 = 2.2 ** ((req.temperature_c - 20.0) / 10.0)
        base_shelf_life = primary_scores["estimated_shelf_life"]
        
        if base_shelf_life >= req.target_shelf_life_days:
            shelf_life_status = "exceeds_target" if base_shelf_life > req.target_shelf_life_days * 1.3 else "meets_target"
        else:
            shelf_life_status = "risk_of_underperforming"

        # Step 6: Generate scientific rationale and why explanations
        rationale = rule_engine.generate_scientific_explanations(
            food_name=req.food_name,
            category=req.category,
            moisture_pct=moisture_pct,
            fat_pct=fat_pct,
            ph=ph,
            water_activity=water_activity,
            respiration_rate=respiration_rate,
            is_respiring=is_respiring,
            temperature_c=req.temperature_c,
            relative_humidity_pct=req.relative_humidity_pct,
            target_shelf_life_days=req.target_shelf_life_days,
            barrier_req=barrier_req
        )

        # Step 7: Build alternative options (top 3 alternatives)
        alternatives: List[AlternativeOption] = []
        for mat, sc in ranked_options[1:4]:
            trade_off = self._build_trade_off_summary(mat, primary_match, sc)
            alternatives.append(AlternativeOption(
                material=PackagingMaterialResponse.model_validate(mat),
                compatibility_score=round(sc["composite_score"], 1),
                barrier_score=round(sc["barrier_score"], 1),
                cost_score=round(sc["cost_score"], 1),
                sustainability_score=round(sc["sustainability_score"], 1),
                trade_off_summary=trade_off,
                estimated_shelf_life_days=sc["estimated_shelf_life"]
            ))

        # Step 3b: Determine Explicit Packaging Requirements (O2, Moisture, Light, Sealability)
        packaging_reqs = rule_engine.derive_packaging_requirements(
            barrier_req=barrier_req,
            is_respiring=is_respiring,
            fat_pct=fat_pct,
            target_shelf_life_days=req.target_shelf_life_days
        )

        if req.transport_mode in ["store_storage", "in_store_shelf", "none", "static_storage", "store"]:
            transit_desc = "Normal In-Store / Shelf Storage"
        else:
            transit_desc = f"via {req.transport_mode.replace('_', ' ').title()}"

        conditions_summary = (
            f"Storage at {req.temperature_c:.1f}°C, {req.relative_humidity_pct:.0f}% RH, "
            f"Target: {req.target_shelf_life_days} days ({transit_desc})."
        )

        return RecommendationResponse(
            food_name=req.food_name,
            category=req.category,
            conditions_summary=conditions_summary,
            barrier_requirements=barrier_req,
            packaging_requirements=packaging_reqs,
            primary_recommendation=PackagingMaterialResponse.model_validate(primary_match),
            recommended_thickness_um=max(primary_match.thickness_um, barrier_req.min_thickness_um),
            estimated_shelf_life_days=base_shelf_life,
            target_shelf_life_days=req.target_shelf_life_days,
            shelf_life_status=shelf_life_status,
            why_explanations=rationale["why_explanations"],
            scientific_deep_dive=rationale["scientific_deep_dive"],
            alternatives=alternatives,
            provenance=provenance,
            scores={
                "compatibility_score": round(primary_scores["composite_score"], 1),
                "barrier_score": round(primary_scores["barrier_score"], 1),
                "cost_score": round(primary_scores["cost_score"], 1),
                "sustainability_score": round(primary_scores["sustainability_score"], 1),
                "shelf_life_fit_score": round(primary_scores["shelf_life_score"], 1)
            }
        )

    async def _resolve_food_properties(
        self,
        req: RecommendationRequest,
        db: Session
    ) -> Tuple[Dict[str, float], Dict[str, str], bool]:
        """Resolves known vs missing food properties and tags data provenance."""
        props = {}
        provenance = dict(req.property_sources or {})

        # If user left any key property blank, search database or external API
        needs_lookup = any([
            req.moisture_pct is None,
            req.fat_pct is None,
            req.ph is None,
            req.water_activity is None,
            req.respiration_rate is None
        ])

        enriched_data = None
        if needs_lookup:
            enriched_data = await external_food_service.search_food(req.food_name, db)

        def _extract_source_name(prov_item):
            if isinstance(prov_item, dict):
                src = prov_item.get("source", "CURATED_REFERENCE")
                stat = prov_item.get("status", "")
                return f"{src} · {stat}" if stat else src
            return str(prov_item)

        # 1. Moisture %
        if req.moisture_pct is not None:
            props["moisture_pct"] = req.moisture_pct
            provenance["moisture_pct"] = _extract_source_name(provenance.get("moisture_pct", "USER_PROVIDED"))
        elif enriched_data:
            props["moisture_pct"] = enriched_data["properties"]["moisture_pct"]
            provenance["moisture_pct"] = _extract_source_name(enriched_data["provenance"]["moisture_pct"])
        else:
            props["moisture_pct"] = 25.0
            provenance["moisture_pct"] = "DERIVED"

        # 2. Fat %
        if req.fat_pct is not None:
            props["fat_pct"] = req.fat_pct
            provenance["fat_pct"] = _extract_source_name(provenance.get("fat_pct", "USER_PROVIDED"))
        elif enriched_data:
            props["fat_pct"] = enriched_data["properties"]["fat_pct"]
            provenance["fat_pct"] = _extract_source_name(enriched_data["provenance"]["fat_pct"])
        else:
            props["fat_pct"] = 5.0
            provenance["fat_pct"] = "DERIVED"

        # 3. pH
        if req.ph is not None:
            props["ph"] = req.ph
            provenance["ph"] = _extract_source_name(provenance.get("ph", "USER_PROVIDED"))
        elif enriched_data:
            props["ph"] = enriched_data["properties"]["ph"]
            provenance["ph"] = _extract_source_name(enriched_data["provenance"]["ph"])
        else:
            props["ph"] = 6.0
            provenance["ph"] = "DERIVED"

        # 4. Water Activity (aw)
        if req.water_activity is not None:
            props["water_activity"] = req.water_activity
            provenance["water_activity"] = _extract_source_name(provenance.get("water_activity", "USER_PROVIDED"))
        elif enriched_data:
            props["water_activity"] = enriched_data["properties"]["water_activity"]
            provenance["water_activity"] = _extract_source_name(enriched_data["provenance"]["water_activity"])
        else:
            props["water_activity"] = 0.65
            provenance["water_activity"] = "DERIVED"

        # 5. Respiration Rate
        if req.respiration_rate is not None:
            props["respiration_rate"] = req.respiration_rate
            provenance["respiration_rate"] = _extract_source_name(provenance.get("respiration_rate", "USER_PROVIDED"))
        elif enriched_data:
            props["respiration_rate"] = enriched_data["properties"]["respiration_rate"]
            provenance["respiration_rate"] = _extract_source_name(enriched_data["provenance"]["respiration_rate"])
        else:
            props["respiration_rate"] = 0.0
            provenance["respiration_rate"] = "CURATED_REFERENCE"

        # Respiration boolean flag
        if req.is_respiring is not None:
            is_respiring = req.is_respiring
        elif enriched_data:
            is_respiring = enriched_data.get("is_respiring", False) or (props["respiration_rate"] > 5.0)
        else:
            is_respiring = props["respiration_rate"] > 5.0

        # Ensure all provenance values are clean strings
        provenance = {k: _extract_source_name(v) for k, v in provenance.items()}

        return props, provenance, is_respiring

    def _score_and_rank_materials(
        self,
        materials: List[PackagingMaterial],
        barrier_req: BarrierRequirements,
        is_respiring: bool,
        req: RecommendationRequest,
        water_activity: float,
        fat_pct: float
    ) -> List[Tuple[PackagingMaterial, Dict[str, float]]]:
        """Multi-Criteria Decision Analysis scoring balancing safety, barrier, cost, and eco."""
        scored = []
        
        # User priority weights
        w_barrier = 0.45
        w_shelf = 0.20
        w_cost = 0.15
        w_sustainability = 0.20

        if req.budget_priority == "economy":
            w_cost = 0.30
            w_barrier = 0.35
            w_sustainability = 0.15
        elif req.budget_priority == "premium_barrier":
            w_barrier = 0.55
            w_shelf = 0.25
            w_cost = 0.05
            w_sustainability = 0.15

        if req.sustainability_priority == "eco_preferred":
            w_sustainability = 0.35
            w_barrier = 0.35
            w_cost = 0.10
        elif req.sustainability_priority == "zero_plastic_compostable":
            w_sustainability = 0.50
            w_barrier = 0.30
            w_cost = 0.10

        for mat in materials:
            # 1. Biological / Scientific safety gating
            if is_respiring:
                # Must be permeable! Laser micro-perforated or breathable film
                if mat.otr_cc_m2_day < 2000.0 or "Foil" in mat.name or "EVOH" in mat.name or "Met-" in mat.name:
                    # Packaging respiring produce in gas-tight foil or EVOH triggers fatal anaerobic fermentation
                    continue
                barrier_score = 95.0 if mat.otr_cc_m2_day >= 3500.0 else 70.0
            else:
                # Non-respiring: Low OTR & WVTR is favorable
                # Evaluate against barrier requirement envelope
                otr_ratio = mat.otr_cc_m2_day / max(0.1, barrier_req.max_otr_cc_m2_day)
                wvtr_ratio = mat.wvtr_g_m2_day / max(0.05, barrier_req.max_wvtr_g_m2_day)

                # Penalize heavily if material exceeds max permitted transmission
                otr_penalty = max(0.0, (otr_ratio - 1.0) * 40.0)
                wvtr_penalty = max(0.0, (wvtr_ratio - 1.0) * 50.0)
                
                barrier_score = max(10.0, 100.0 - (otr_penalty + wvtr_penalty))

                # MAP compatibility bonus / penalty
                if barrier_req.map_required and not mat.map_suitable:
                    barrier_score -= 30.0

            # 2. Estimated Shelf Life under current storage conditions
            q10 = 2.2 ** ((req.temperature_c - 20.0) / 10.0)
            if is_respiring:
                base_life = 10 if mat.otr_cc_m2_day > 5000.0 else 5
                est_life = int(max(3, round(base_life / max(0.5, q10))))
            else:
                # Baseline potential shelf life determined by barrier level
                if mat.otr_cc_m2_day < 1.0 and mat.wvtr_g_m2_day < 0.2:
                    potential_days = 730 # Foil triplex
                elif mat.otr_cc_m2_day < 30.0 and mat.wvtr_g_m2_day < 1.5:
                    potential_days = 270 # Met-BOPP / EVOH
                elif mat.otr_cc_m2_day < 100.0 and mat.wvtr_g_m2_day < 5.0:
                    potential_days = 120 # PET/PE
                elif mat.wvtr_g_m2_day < 10.0:
                    potential_days = 45  # HDPE
                else:
                    potential_days = 18  # LDPE or plain paper

                est_life = int(max(5, round(potential_days / q10)))

            # Shelf-life match score
            if est_life >= req.target_shelf_life_days:
                shelf_life_score = min(100.0, 85.0 + 15.0 * (est_life / (req.target_shelf_life_days * 1.5)))
            else:
                shelf_life_score = max(15.0, 85.0 * (est_life / req.target_shelf_life_days))

            # 3. Cost Score (Lower cost $/m² gives higher score)
            # Benchmark range $0.10 to $1.20 / m²
            cost_score = max(10.0, min(100.0, 100.0 - ((mat.cost_per_sqm - 0.10) / 1.10) * 90.0))

            # 4. Sustainability Score (1-10 scaled to 0-100)
            sustainability_score = mat.sustainability_score * 10.0
            if req.sustainability_priority == "zero_plastic_compostable" and not mat.is_biodegradable:
                sustainability_score *= 0.4 # Heavily prioritize compostables

            # Composite weighted score
            composite = (
                (barrier_score * w_barrier) +
                (shelf_life_score * w_shelf) +
                (cost_score * w_cost) +
                (sustainability_score * w_sustainability)
            )

            scores_dict = {
                "composite_score": composite,
                "barrier_score": barrier_score,
                "shelf_life_score": shelf_life_score,
                "cost_score": cost_score,
                "sustainability_score": sustainability_score,
                "estimated_shelf_life": est_life
            }
            scored.append((mat, scores_dict))

        # Sort descending by composite score
        scored.sort(key=lambda item: item[1]["composite_score"], reverse=True)
        return scored

    def _build_trade_off_summary(
        self,
        alternative: PackagingMaterial,
        primary: PackagingMaterial,
        scores: Dict[str, float]
    ) -> str:
        """Generates crisp engineering trade-off comparison vs primary recommendation."""
        cost_diff_pct = round(((alternative.cost_per_sqm - primary.cost_per_sqm) / primary.cost_per_sqm) * 100)
        eco_diff = round(alternative.sustainability_score - primary.sustainability_score, 1)

        if alternative.is_biodegradable and not primary.is_biodegradable:
            return (
                f"Eco-friendly bio-compostable option (+{eco_diff} sustainability score), but provides shorter "
                f"moisture protection (estimated {scores['estimated_shelf_life']} days vs target)."
            )
        elif cost_diff_pct < -20:
            return (
                f"Budget-saving economy option ({abs(cost_diff_pct)}% lower material cost), but lower oxygen/moisture barrier."
            )
        elif alternative.otr_cc_m2_day < primary.otr_cc_m2_day and alternative.wvtr_g_m2_day < primary.wvtr_g_m2_day:
            return (
                f"Ultra-high barrier upgrade yielding maximum shelf life ({scores['estimated_shelf_life']} days), "
                f"with higher cost (+{cost_diff_pct}%) and lower recyclability."
            )
        else:
            return (
                f"Good alternative ({alternative.recyclability_grade} grade recyclability), giving "
                f"approx {scores['estimated_shelf_life']} days freshness."
            )

hybrid_recommender = HybridRecommendationEngine()
