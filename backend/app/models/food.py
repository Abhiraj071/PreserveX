from sqlalchemy import Column, Integer, String, Float, Text, Boolean
from app.database import Base

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, index=True, nullable=False)
    category = Column(String(60), index=True, nullable=False)
    
    # Intrinsic food physical-chemical properties
    moisture_pct = Column(Float, nullable=False)          # % moisture (0-100)
    fat_pct = Column(Float, nullable=False)               # % fat content (0-100)
    ph = Column(Float, nullable=False)                    # pH value (1.0 - 14.0)
    water_activity = Column(Float, nullable=False)        # aw (0.10 - 1.00)
    respiration_rate = Column(Float, default=0.0)         # mg CO2 / kg*hr at 10-20°C (0 for non-respiring)
    
    # Sensory & deterioration characteristics
    is_respiring = Column(Boolean, default=False)
    moisture_sensitivity = Column(String(20), default="medium")  # low, medium, high, critical
    oxygen_sensitivity = Column(String(20), default="medium")    # low, medium, high, critical
    light_sensitivity = Column(String(20), default="low")        # low, medium, high
    
    # Metadata & Provenance
    source = Column(String(80), default="USDA/FAO Reference Database")
    typical_shelf_life_days = Column(Integer, default=30)
    ideal_storage_temp = Column(Float, default=4.0)
    ideal_rh = Column(Float, default=65.0)
    description = Column(Text, nullable=True)
