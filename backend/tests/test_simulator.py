import pytest
from app.database import SessionLocal, engine, Base
from app.data.seed_data import seed_database
from app.schemas.recommendation import SimulationRequest
from app.services.simulator import what_if_simulator

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    seed_database(session)
    yield session
    session.close()

def test_what_if_simulator_temperature_stress(db_session):
    # Test crisps under high temperature stress (38°C) vs standard (20°C)
    req_ambient = SimulationRequest(
        food_name="Potato Chips",
        base_properties={"moisture_pct": 2.0, "fat_pct": 34.0, "water_activity": 0.20, "respiration_rate": 0.0},
        temperature_c=20.0,
        relative_humidity_pct=50.0,
        target_shelf_life_days=180
    )
    res_ambient = what_if_simulator.run_simulation(req_ambient, db_session)
    assert res_ambient.arrhenius_acceleration_factor == 1.0
    
    req_hot = SimulationRequest(
        food_name="Potato Chips",
        base_properties={"moisture_pct": 2.0, "fat_pct": 34.0, "water_activity": 0.20, "respiration_rate": 0.0},
        temperature_c=40.0,
        relative_humidity_pct=85.0,
        target_shelf_life_days=180
    )
    res_hot = what_if_simulator.run_simulation(req_hot, db_session)
    # Arrhenius factor should be ~4.84x (2.2^2)
    assert res_hot.arrhenius_acceleration_factor > 4.0
    # Predicted shelf life should drop significantly
    assert res_hot.predicted_shelf_life_days < res_ambient.predicted_shelf_life_days
    assert "Triplex Foil" in res_hot.recommended_material_name or "Met-BOPP" in res_hot.recommended_material_name
