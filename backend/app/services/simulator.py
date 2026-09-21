import math
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.packaging import PackagingMaterial
from app.schemas.recommendation import (
    SimulationRequest, 
    SimulationResponse, 
    RecommendationRequest
)
from app.services.rule_engine import ScientificRuleEngine
from app.services.recommender import hybrid_recommender

class WhatIfPackagingSimulator:
    """
    Dynamic What-If Packaging Simulator.
    Shares the exact same rule engine, packaging requirements determination,
    and material candidate scoring pipeline as the core recommender.
    """

    @staticmethod
    def run_simulation(req: SimulationRequest, db: Session) -> SimulationResponse:
        temp = req.temperature_c
        rh = req.relative_humidity_pct
        target_days = req.target_shelf_life_days
        props = req.base_properties

        moisture_pct = props.get("moisture_pct", 15.0)
        fat_pct = props.get("fat_pct", 5.0)
        ph = props.get("ph", 6.0)
        aw = props.get("water_activity", 0.50)
        respiration_rate = props.get("respiration_rate", 0.0)
        is_respiring = respiration_rate > 5.0

        # Arrhenius Kinetic Acceleration factor (Q10 = 2.2, reference 20°C)
        q10_factor = round(math.pow(2.2, (temp - 20.0) / 10.0), 2)

        # Saturated vapor pressure (kPa) via Tetens equation
        p_sat = 0.61078 * math.exp((17.27 * temp) / (temp + 237.3))
        ambient_aw = rh / 100.0
        delta_aw = abs(ambient_aw - aw)
        
        # Estimate daily moisture flux index and oxygen flux index
        moisture_flux = round(delta_aw * p_sat * (temp + 273.15) / 293.15, 3)
        oxygen_flux = round(q10_factor * (1.0 + (fat_pct / 20.0)), 2)

        # Determine Critical Spoilage Failure Pathway
        if is_respiring:
            if temp > 15.0:
                failure_mode = "Rapid Tissue Respiration & Anaerobic Souring"
            else:
                failure_mode = "In-Pack Condensation & Fungal Rot (Botrytis)"
        elif aw < 0.35:
            if delta_aw > 0.30:
                failure_mode = "Moisture Absorption (Loss of Crispness / Sogginess)"
            elif fat_pct > 20.0 and temp > 28.0:
                failure_mode = "Thermal Lipid Oxidation & Stale Rancidity"
            else:
                failure_mode = "Moisture Ingress & Texture Staling"
        elif fat_pct > 25.0:
            failure_mode = "Accelerated Peroxide Formation & Oxidative Rancidity"
        elif aw > 0.85:
            if temp > 10.0:
                failure_mode = "Accelerated Microbial Growth (Mesophilic Bacteria & Molds)"
            else:
                failure_mode = "Surface Desiccation / Moisture Migration"
        else:
            failure_mode = "Loss of Volatile Aromas & Texture Softening"

        # 1. Calculate Required Barrier Envelope under simulated conditions using Rule Engine
        barrier_req = ScientificRuleEngine.calculate_barrier_envelope(
            moisture_pct=moisture_pct,
            fat_pct=fat_pct,
            ph=ph,
            water_activity=aw,
            respiration_rate=respiration_rate,
            is_respiring=is_respiring,
            temperature_c=temp,
            relative_humidity_pct=rh,
            target_shelf_life_days=target_days
        )

        # 2. Derive explicit Packaging Requirements (Oxygen, Moisture, Light, Sealability)
        pkg_reqs = ScientificRuleEngine.derive_packaging_requirements(
            barrier_req=barrier_req,
            is_respiring=is_respiring,
            fat_pct=fat_pct,
            target_shelf_life_days=target_days
        )

        # 3. Query all packaging materials and rank with Hybrid Recommendation Engine
        all_materials = db.query(PackagingMaterial).all()
        synthetic_req = RecommendationRequest(
            food_name=req.food_name,
            temperature_c=temp,
            relative_humidity_pct=rh,
            target_shelf_life_days=target_days,
            storage_type="chilled" if temp < 10.0 else ("ambient" if temp < 30.0 else "tropical"),
            moisture_pct=moisture_pct,
            fat_pct=fat_pct,
            ph=ph,
            water_activity=aw,
            respiration_rate=respiration_rate,
            is_respiring=is_respiring
        )

        ranked = hybrid_recommender._score_and_rank_materials(
            materials=all_materials,
            barrier_req=barrier_req,
            is_respiring=is_respiring,
            req=synthetic_req,
            water_activity=aw,
            fat_pct=fat_pct
        )

        rec_mat, rec_scores = ranked[0]
        predicted_days = rec_scores["estimated_shelf_life"]

        # Build clean dynamic rationale explaining why packaging changed
        if temp >= 32.0 or rh >= 80.0:
            rationale = (
                f"Elevated stress ({temp:.1f}°C, {rh:.0f}% RH) accelerates decay kinetics by {q10_factor:.1f}×. "
                f"System adapts by requiring {pkg_reqs.moisture_barrier_level} moisture barrier ({pkg_reqs.target_wvtr_range}) "
                f"and {pkg_reqs.oxygen_barrier_level} oxygen barrier, matching {rec_mat.name}."
            )
        elif temp <= 8.0:
            rationale = (
                f"Chilled storage ({temp:.1f}°C) suppresses degradation kinetics (0.5× factor). "
                f"Enables using standard recyclable {rec_mat.name} while maintaining target freshness."
            )
        else:
            rationale = (
                f"Ambient baseline conditions ({temp:.1f}°C, {rh:.0f}% RH) require {pkg_reqs.moisture_barrier_level} moisture barrier, "
                f"optimally satisfied by {rec_mat.name}."
            )

        # Suitability indicator
        if predicted_days >= target_days:
            color = "green"
        elif predicted_days >= target_days * 0.7:
            color = "yellow"
        else:
            color = "red"

        return SimulationResponse(
            temperature_c=temp,
            relative_humidity_pct=rh,
            target_shelf_life_days=target_days,
            arrhenius_acceleration_factor=q10_factor,
            moisture_permeation_rate=moisture_flux,
            oxygen_ingress_rate=oxygen_flux,
            predicted_shelf_life_days=predicted_days,
            critical_failure_mode=failure_mode,
            recommended_material_name=rec_mat.name,
            material_structure=rec_mat.layer_description,
            recalculation_rationale=rationale,
            suitability_color=color
        )

what_if_simulator = WhatIfPackagingSimulator()
