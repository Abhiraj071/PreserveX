from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class FoodItemBase(BaseModel):
    name: str
    category: str
    moisture_pct: float = Field(..., ge=0.0, le=100.0)
    fat_pct: float = Field(..., ge=0.0, le=100.0)
    ph: float = Field(..., ge=1.0, le=14.0)
    water_activity: float = Field(..., ge=0.05, le=1.00)
    respiration_rate: float = Field(default=0.0, ge=0.0)
    is_respiring: bool = False
    moisture_sensitivity: str = "medium"
    oxygen_sensitivity: str = "medium"
    light_sensitivity: str = "low"
    typical_shelf_life_days: int = 30
    ideal_storage_temp: float = 4.0
    ideal_rh: float = 65.0
    description: Optional[str] = None
    source: str = "FAOSTAT/INFOODS Curated Reference"

class FoodItemResponse(FoodItemBase):
    id: int

    class Config:
        from_attributes = True

class PropertyProvenance(BaseModel):
    value: float
    source: str  # USER_PROVIDED | OPEN_FOOD_FACTS | FAOSTAT_INFOODS | CURATED_REFERENCE | DERIVED
    status: str  # MEASURED | REFERENCE | DERIVED | ESTIMATED
    confidence_pct: int = 90
    note: Optional[str] = None

class FoodEnrichmentResponse(BaseModel):
    food_name: str
    category: str
    matched_source: str  # "open_food_facts" | "reference_db" | "faostat_reference" | "partial_estimate"
    properties: Dict[str, float]  # moisture_pct, fat_pct, ph, water_activity, respiration_rate
    provenance: Dict[str, Any]    # Dict[str, PropertyProvenance] or raw strings for backward compatibility
    is_respiring: bool = False
    barcode: Optional[str] = None
    image_url: Optional[str] = None
    ingredients_text: Optional[str] = None
    allergens: Optional[List[str]] = None
    brand: Optional[str] = None
    current_packaging: Optional[str] = None
    nutrition_per_100g: Optional[Dict[str, float]] = None
    data_quality_score: int = 85
