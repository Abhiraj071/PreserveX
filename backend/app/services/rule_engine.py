import math
from typing import Dict, Any, List
from app.schemas.recommendation import BarrierRequirements, PackagingRequirements

class ScientificRuleEngine:
    """
    Scientific Rule Engine for Food Packaging Engineering.
    Translates intrinsic food biochemical properties and extrinsic environmental stress
    into required barrier performance levels (OTR, WVTR, thickness, MAP, sealability).
    """

    @staticmethod
    def derive_packaging_requirements(
        barrier_req: BarrierRequirements,
        is_respiring: bool,
        fat_pct: float,
        target_shelf_life_days: int
    ) -> PackagingRequirements:
        """
        Determines the explicit high-level packaging performance requirements (High/Medium/Low)
        and target operational ranges before candidate matching.
        """
        # Oxygen Barrier Level
        if is_respiring:
            o2_level = "BREATHABLE"
            otr_target = "≥ 3500 cc/m²·day·atm (Permeable / Micro-perforated)"
        elif barrier_req.max_otr_cc_m2_day <= 1.0:
            o2_level = "ULTRA_HIGH"
            otr_target = f"≤ {barrier_req.max_otr_cc_m2_day:.1f} cc/m²·day·atm"
        elif barrier_req.max_otr_cc_m2_day <= 50.0:
            o2_level = "HIGH"
            otr_target = f"≤ {barrier_req.max_otr_cc_m2_day:.1f} cc/m²·day·atm"
        elif barrier_req.max_otr_cc_m2_day <= 200.0:
            o2_level = "MEDIUM"
            otr_target = f"≤ {barrier_req.max_otr_cc_m2_day:.1f} cc/m²·day·atm"
        else:
            o2_level = "LOW"
            otr_target = f"≤ {barrier_req.max_otr_cc_m2_day:.1f} cc/m²·day·atm"

        # Moisture Barrier Level
        if barrier_req.max_wvtr_g_m2_day <= 0.5:
            moist_level = "ULTRA_HIGH"
            wvtr_target = f"≤ {barrier_req.max_wvtr_g_m2_day:.2f} g/m²·day"
        elif barrier_req.max_wvtr_g_m2_day <= 2.5:
            moist_level = "HIGH"
            wvtr_target = f"≤ {barrier_req.max_wvtr_g_m2_day:.1f} g/m²·day"
        elif barrier_req.max_wvtr_g_m2_day <= 15.0:
            moist_level = "MEDIUM"
            wvtr_target = f"≤ {barrier_req.max_wvtr_g_m2_day:.1f} g/m²·day"
        else:
            moist_level = "LOW"
            wvtr_target = f"≤ {barrier_req.max_wvtr_g_m2_day:.1f} g/m²·day"

        # Light Barrier Level
        if barrier_req.light_barrier_required:
            light_level = "TOTAL" if (fat_pct > 25.0 or target_shelf_life_days > 120) else "MODERATE"
        else:
            light_level = "NONE"

        # Sealability Level
        seal_level = "HERMETIC" if barrier_req.map_required else ("HIGH" if target_shelf_life_days > 60 else "STANDARD")
        puncture_level = barrier_req.puncture_resistance_needed.upper()

        return PackagingRequirements(
            oxygen_barrier_level=o2_level,
            moisture_barrier_level=moist_level,
            light_barrier_level=light_level,
            sealability_level=seal_level,
            puncture_resistance_level=puncture_level,
            target_otr_range=otr_target,
            target_wvtr_range=wvtr_target,
            target_thickness_range=f"≥ {barrier_req.min_thickness_um:.0f} µm",
            map_gas_recommended=barrier_req.recommended_map_gas
        )

    @staticmethod
    def calculate_barrier_envelope(
        moisture_pct: float,
        fat_pct: float,
        ph: float,
        water_activity: float,
        respiration_rate: float,
        is_respiring: bool,
        temperature_c: float,
        relative_humidity_pct: float,
        target_shelf_life_days: int
    ) -> BarrierRequirements:
        """
        Derives maximum allowable OTR, WVTR, minimum thickness, and MAP requirements
        based on mass transfer equations and biochemical decay pathways.
        """
        # --- 1. Temperature & Humidity Acceleration Stress ---
        # Baseline reference is 20°C. Arrhenius Q10 factor = 2.2 for general degradation
        temp_delta = max(-10.0, min(35.0, temperature_c - 20.0))
        q10_factor = math.pow(2.2, temp_delta / 10.0)
        
        # Vapor pressure driving force (ambient RH vs food water activity)
        # Saturated vapor pressure at T (Tetens equation in kPa)
        p_sat = 0.61078 * math.exp((17.27 * temperature_c) / (temperature_c + 237.3))
        ambient_aw = relative_humidity_pct / 100.0
        delta_aw = abs(ambient_aw - water_activity)
        
        # --- 2. Water Vapor Transmission Rate (WVTR) Envelope ---
        if is_respiring:
            # Respiring produce needs breathability to prevent in-pack condensation & mold
            max_wvtr = 50.0
        elif water_activity < 0.35:
            # Extremely dry / crisp foods (potato chips, crackers, biscuits, milk powder)
            # High humidity difference drives moisture ingress rapidly
            # Strict WVTR limit needed: 0.5 to 2.5 g/m²·day depending on target shelf life
            shelf_life_penalty = max(1.0, target_shelf_life_days / 90.0)
            max_wvtr = max(0.2, min(3.0, 2.5 / (shelf_life_penalty * q10_factor * max(0.3, delta_aw))))
        elif water_activity > 0.85:
            # High moisture wet foods (meat, cheese, fresh pasta)
            # Needs barrier to prevent desiccation / drying out
            max_wvtr = max(1.5, min(15.0, 12.0 / q10_factor))
        else:
            # Intermediate moisture foods (0.35 - 0.85 aw)
            max_wvtr = max(2.0, min(20.0, 15.0 / (q10_factor * max(0.2, delta_aw))))

        # --- 3. Oxygen Transmission Rate (OTR) Envelope ---
        if is_respiring:
            # Fresh Produce: MUST NOT be airtight! Requires gas exchange to prevent anaerobic fermentation
            # Higher respiration -> needs higher OTR or micro-perforations
            if respiration_rate > 50.0:
                max_otr = 10000.0 # Laser micro-perforation needed
            else:
                max_otr = 3500.0  # Breathable polyolefin
        elif fat_pct > 25.0:
            # Very high lipid content (potato chips, nuts, butter, chocolate)
            # Critical risk: auto-oxidation and hexanal off-flavor
            shelf_life_penalty = max(1.0, target_shelf_life_days / 90.0)
            max_otr = max(0.5, min(30.0, 25.0 / (shelf_life_penalty * q10_factor)))
        elif fat_pct > 8.0:
            # Moderate lipid content (baked goods, whole grains, dairy, meats)
            max_otr = max(2.0, min(80.0, 70.0 / q10_factor))
        elif water_activity > 0.90:
            # Fresh meat/poultry: Aerobic spoilage microbes (Pseudomonas) require low O2 or high CO2 MAP
            max_otr = 10.0
        else:
            # Low fat, non-respiring food
            max_otr = max(50.0, min(1500.0, 1200.0 / q10_factor))

        # --- 4. MAP & Atmosphere Requirements ---
        map_required = False
        map_gas = None
        if is_respiring:
            map_required = True
            map_gas = "Equilibrium MAP: 3-5% O2, 5-8% CO2, balance N2 (Prevents anaerobic fermentation)"
        elif water_activity > 0.90 and ph >= 4.5:
            map_required = True
            map_gas = "Inert/Antimicrobial MAP: 70% N2 / 30% CO2 (Inhibits aerobic psychrotrophic bacteria)"
        elif fat_pct > 20.0 and target_shelf_life_days >= 60:
            map_required = True
            map_gas = "Nitrogen Flush: 99.5% N2, < 0.5% residual O2 (Prevents lipid oxidation & rancidity)"

        # --- 5. Light Barrier & Thickness ---
        light_barrier_required = (fat_pct > 15.0 and target_shelf_life_days > 60) or (is_respiring is False and water_activity < 0.35)
        
        # Base thickness scaling based on stress and shelf life
        if target_shelf_life_days > 180 or temp_delta > 10.0:
            min_thickness = 50.0
        elif target_shelf_life_days > 60:
            min_thickness = 35.0
        else:
            min_thickness = 25.0

        # Puncture resistance based on food type
        puncture_resistance = "high" if (fat_pct > 15.0 or "Nut" in str(moisture_pct)) else "medium"

        return BarrierRequirements(
            max_otr_cc_m2_day=round(max_otr, 2),
            max_wvtr_g_m2_day=round(max_wvtr, 2),
            min_thickness_um=min_thickness,
            min_sealability_score=8.0 if map_required else 7.0,
            map_required=map_required,
            recommended_map_gas=map_gas,
            light_barrier_required=light_barrier_required,
            puncture_resistance_needed=puncture_resistance
        )

    @staticmethod
    def generate_scientific_explanations(
        food_name: str,
        category: str,
        moisture_pct: float,
        fat_pct: float,
        ph: float,
        water_activity: float,
        respiration_rate: float,
        is_respiring: bool,
        temperature_c: float,
        relative_humidity_pct: float,
        target_shelf_life_days: int,
        barrier_req: BarrierRequirements
    ) -> Dict[str, Any]:
        """
        Builds transparent, scientific justifications explaining WHY particular packaging
        specifications were engineered for this specific product and environment.
        """
        explanations: List[str] = []
        deep_dive: Dict[str, str] = {}

        # 1. Moisture explanation
        if is_respiring:
            moist_text = (
                f"As active respiring produce ({respiration_rate} mg CO₂/kg·hr), excessive moisture retention "
                f"causes vapor saturation (RH ~100%) and in-pack condensation. This triggers rapid fungal decay (e.g. Botrytis). "
                f"Engineered breathable film (WVTR ~{barrier_req.max_wvtr_g_m2_day} g/m²·day) prevents condensation droplet buildup."
            )
            explanations.append("Controlled moisture permeation to prevent condensation fogging and fungal spoilage.")
        elif water_activity < 0.35:
            moist_text = (
                f"With a very low water activity (aw = {water_activity:.2f}) and moisture of {moisture_pct:.1f}%, "
                f"the product is highly hygroscopic. Ambient relative humidity ({relative_humidity_pct:.0f}%) creates a strong vapor pressure gradient (Δaw = {abs(relative_humidity_pct/100 - water_activity):.2f}). "
                f"A strict moisture barrier (WVTR ≤ {barrier_req.max_wvtr_g_m2_day} g/m²·day) is essential to avoid texture collapse (loss of crispness)."
            )
            explanations.append(f"Strict moisture barrier (WVTR ≤ {barrier_req.max_wvtr_g_m2_day} g/m²·day) required to preserve crispness and prevent sogginess.")
        elif water_activity > 0.85:
            moist_text = (
                f"High water activity (aw = {water_activity:.2f}) presents risk of both product desiccation (drying out) "
                f"and microbial proliferation. Hermetic sealing and regulated moisture retention maintain juiciness without water pooling."
            )
            explanations.append("High barrier required to retain natural food moisture and prevent surface crusting.")
        else:
            moist_text = f"Intermediate water activity (aw = {water_activity:.2f}) requires balanced moisture retention over {target_shelf_life_days} days."
            explanations.append("Moderate moisture vapor barrier balanced for shelf stability.")
        deep_dive["moisture_risk"] = moist_text

        # 2. Oxygen & Oxidation explanation
        if is_respiring:
            oxy_text = (
                f"Fresh produce requires continuous aerobic respiration. If oxygen transmission rate drops below 1000 cc/m²·day, "
                f"depleted in-pack O₂ (< 1%) induces anaerobic glycolysis, generating off-flavor ethanol and acetaldehyde. "
                f"Therefore, high OTR ({barrier_req.max_otr_cc_m2_day} cc/m²·day) or micro-perforations are mandatory."
            )
            explanations.append("High gas permeability maintains aerobic respiration and prevents toxic fermentation.")
        elif fat_pct > 20.0:
            oxy_text = (
                f"High lipid content ({fat_pct:.1f}%) makes this food susceptible to free-radical lipid peroxidation. "
                f"Exposure to atmospheric oxygen triggers chain reactions forming hydroperoxides, aldehydes, and rancid off-flavors. "
                f"Restricting OTR to ≤ {barrier_req.max_otr_cc_m2_day} cc/m²·day{' with Nitrogen flushing' if barrier_req.map_required else ''} shields fatty acids."
            )
            explanations.append(f"Ultra-low OTR (≤ {barrier_req.max_otr_cc_m2_day} cc/m²·day) and light barrier shield fats from oxidative rancidity.")
        elif fat_pct > 5.0:
            oxy_text = f"Moderate fat content ({fat_pct:.1f}%) requires standard barrier protection (OTR ≤ {barrier_req.max_otr_cc_m2_day} cc/m²·day) against flavor degradation."
            explanations.append("Controlled oxygen barrier prevents gradual flavor degradation.")
        else:
            oxy_text = "Low fat content poses negligible rancidity risk; primary focus remains on moisture barrier and physical containment."
            explanations.append("Standard gas barrier sufficient due to low lipid vulnerability.")
        deep_dive["oxidation_risk"] = oxy_text

        # 3. Respiration & MAP explanation
        if is_respiring:
            resp_text = (
                f"Equilibrium Modified Atmosphere Packaging (EMAP) is recommended. The respiration quotient of {food_name} "
                f"stabilizes within the pack at 3-5% O₂ and 5-8% CO₂, slowing enzymatic senescence without asphyxiation."
            )
        elif barrier_req.map_required:
            resp_text = f"Recommended gas mixture: {barrier_req.recommended_map_gas}. Displaces headspace oxygen and suppresses aerobic colony formation."
        else:
            resp_text = "Ambient atmosphere packaging is acceptable for this stable product matrix."
        deep_dive["respiration_dynamics"] = resp_text

        # 4. Temperature stress & Arrhenius kinetic explanation
        temp_factor = math.pow(2.2, (temperature_c - 20.0) / 10.0)
        temp_text = (
            f"Storage at {temperature_c:.1f}°C exerts an Arrhenius acceleration factor of {temp_factor:.2f}× relative to 20°C standard. "
            f"Polymer permeability increases with thermal activation energy, necessitating thicker substrate or co-extruded barrier layers for a {target_shelf_life_days}-day target."
        )
        deep_dive["temperature_acceleration"] = temp_text

        return {
            "why_explanations": explanations,
            "scientific_deep_dive": deep_dive
        }

rule_engine = ScientificRuleEngine()
