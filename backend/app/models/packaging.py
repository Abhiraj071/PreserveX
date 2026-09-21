from sqlalchemy import Column, Integer, String, Float, Text, Boolean
from app.database import Base

class PackagingMaterial(Base):
    __tablename__ = "packaging_materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, index=True, nullable=False)
    structure_type = Column(String(60), nullable=False)  # Monolayer, Coextruded, Multilayer Laminate, Biodegradable
    layer_description = Column(String(200), nullable=False) # e.g. "BOPP 20µm / Met-PET 12µm / LDPE 35µm"
    
    # Barrier Engineering Properties (standard test conditions: 23°C/0% RH for OTR, 38°C/90% RH for WVTR)
    thickness_um = Column(Float, nullable=False)               # Nominal thickness in micrometers (microns)
    otr_cc_m2_day = Column(Float, nullable=False)              # Oxygen Transmission Rate (cc / m² · day · atm)
    wvtr_g_m2_day = Column(Float, nullable=False)              # Water Vapor Transmission Rate (g / m² · day)
    co2_permeability = Column(Float, nullable=True)            # CO2 Transmission Rate (cc / m² · day · atm)
    
    # Mechanical & Processing Properties
    sealability_score = Column(Float, default=8.0)             # 1.0 to 10.0 (heat seal integrity, hot tack)
    puncture_resistance = Column(String(20), default="medium") # low, medium, high, extreme
    tensile_strength_mpa = Column(Float, default=30.0)         # Mechanical strength in MPa
    map_suitable = Column(Boolean, default=False)              # Suitable for Modified Atmosphere Packaging
    
    # Commercial & Environmental Metrics
    cost_per_sqm = Column(Float, nullable=False)               # Cost index in USD / m²
    sustainability_score = Column(Float, nullable=False)       # 1.0 (lowest eco) to 10.0 (highest eco)
    recyclability_grade = Column(String(10), nullable=False)   # "A+" (curbside circular), "A", "B", "C", "D"
    is_biodegradable = Column(Boolean, default=False)          # Home or industrial compostable
    carbon_footprint_kg_co2_kg = Column(Float, default=2.5)   # kg CO2 eq / kg polymer
    
    # Engineering Notes & Best Fits
    typical_applications = Column(Text, nullable=True)
    key_advantages = Column(Text, nullable=True)
    limitations = Column(Text, nullable=True)
