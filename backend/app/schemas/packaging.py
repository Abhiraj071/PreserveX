from pydantic import BaseModel
from typing import Optional

class PackagingMaterialBase(BaseModel):
    name: str
    structure_type: str
    layer_description: str
    thickness_um: float
    otr_cc_m2_day: float
    wvtr_g_m2_day: float
    co2_permeability: Optional[float] = None
    sealability_score: float = 8.0
    puncture_resistance: str = "medium"
    tensile_strength_mpa: float = 30.0
    map_suitable: bool = False
    cost_per_sqm: float
    sustainability_score: float
    recyclability_grade: str
    is_biodegradable: bool = False
    carbon_footprint_kg_co2_kg: float = 2.5
    typical_applications: Optional[str] = None
    key_advantages: Optional[str] = None
    limitations: Optional[str] = None

class PackagingMaterialResponse(PackagingMaterialBase):
    id: int

    class Config:
        from_attributes = True
