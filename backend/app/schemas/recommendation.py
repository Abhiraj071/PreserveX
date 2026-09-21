from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.schemas.packaging import PackagingMaterialResponse

class RecommendationRequest(BaseModel):
    food_name: str
    category: str = "General"
    
    # Storage & Transportation conditions
    storage_type: str = "ambient" # "ambient", "refrigerated", "frozen", "tropical"
    temperature_c: float = Field(default=22.0, ge=-25.0, le=55.0)
    relative_humidity_pct: float = Field(default=65.0, ge=10.0, le=100.0)
    target_shelf_life_days: int = Field(default=90, ge=1, le=1000)
    transport_mode: str = "ambient_road" # "ambient_road", "reefer_truck", "sea_freight", "air_cargo"
    
    # Priorities
    budget_priority: str = "balanced" # "economy", "balanced", "premium_barrier"
    sustainability_priority: str = "standard" # "standard", "eco_preferred", "zero_plastic_compostable"
    
    # Optional Technical Food Properties (Auto-filled or User-Specified)
    moisture_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    fat_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    ph: Optional[float] = Field(default=None, ge=1.0, le=14.0)
    water_activity: Optional[float] = Field(default=None, ge=0.05, le=1.00)
    respiration_rate: Optional[float] = Field(default=None, ge=0.0)
    is_respiring: Optional[bool] = None

    # Track provenance of inputs
    property_sources: Optional[Dict[str, Any]] = Field(default_factory=dict)

class BarrierRequirements(BaseModel):
    max_otr_cc_m2_day: float
    max_wvtr_g_m2_day: float
    min_thickness_um: float
    min_sealability_score: float
    map_required: bool
    recommended_map_gas: Optional[str] = None
    light_barrier_required: bool
    puncture_resistance_needed: str

class PackagingRequirements(BaseModel):
    oxygen_barrier_level: str # "LOW" | "MEDIUM" | "HIGH" | "ULTRA_HIGH" | "BREATHABLE"
    moisture_barrier_level: str # "LOW" | "MEDIUM" | "HIGH" | "ULTRA_HIGH"
    light_barrier_level: str # "NONE" | "MODERATE" | "TOTAL"
    sealability_level: str # "STANDARD" | "HIGH" | "HERMETIC"
    puncture_resistance_level: str # "LOW" | "MEDIUM" | "HIGH"
    target_otr_range: str # "≤ 30.0 cc/m²·day·atm"
    target_wvtr_range: str # "≤ 1.5 g/m²·day"
    target_thickness_range: str # "≥ 50.0 µm"
    map_gas_recommended: Optional[str] = None

class AlternativeOption(BaseModel):
    material: PackagingMaterialResponse
    compatibility_score: float # 0 - 100
    cost_score: float          # 0 - 100
    sustainability_score: float# 0 - 100
    barrier_score: float       # 0 - 100
    trade_off_summary: str
    estimated_shelf_life_days: int

class RecommendationResponse(BaseModel):
    food_name: str
    category: str
    conditions_summary: str
    
    # Engineered Barrier Envelopes & Explicit Packaging Requirements
    barrier_requirements: BarrierRequirements
    packaging_requirements: Optional[PackagingRequirements] = None
    
    # Primary Best Match
    primary_recommendation: PackagingMaterialResponse
    recommended_thickness_um: float
    estimated_shelf_life_days: int
    target_shelf_life_days: int
    shelf_life_status: str # "exceeds_target" | "meets_target" | "risk_of_underperforming"
    
    # Scientific Justifications
    why_explanations: List[str]
    scientific_deep_dive: Dict[str, str] # "moisture_risk", "oxidation_risk", "respiration_dynamics", "temperature_acceleration"
    
    # Viable Alternatives
    alternatives: List[AlternativeOption]
    
    # Provenance tracking
    provenance: Dict[str, str]
    
    # Overall multi-criteria scores for radar visualization
    scores: Dict[str, float]

class SimulationRequest(BaseModel):
    food_name: str
    base_properties: Dict[str, float] # moisture_pct, fat_pct, ph, water_activity, respiration_rate
    temperature_c: float = Field(..., ge=-20.0, le=50.0)
    relative_humidity_pct: float = Field(..., ge=15.0, le=98.0)
    target_shelf_life_days: int = Field(..., ge=7, le=730)
    current_material_id: Optional[int] = None

class SimulationResponse(BaseModel):
    temperature_c: float
    relative_humidity_pct: float
    target_shelf_life_days: int
    
    # Dynamic recalculations
    arrhenius_acceleration_factor: float
    moisture_permeation_rate: float
    oxygen_ingress_rate: float
    predicted_shelf_life_days: int
    critical_failure_mode: str # "Moisture Gain / Soggy", "Lipid Rancidity", "Anaerobic Fermentation", "Microbial Spoilage"
    
    # Recommended material under these new stress conditions
    recommended_material_name: str
    material_structure: str
    recalculation_rationale: str
    suitability_color: str # "green", "yellow", "red"
