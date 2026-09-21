import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

print("[1/5] Testing Rule Engine...")
from app.services.rule_engine import rule_engine
barrier = rule_engine.calculate_barrier_envelope(
    moisture_pct=2.0, fat_pct=34.0, ph=5.8, water_activity=0.20,
    respiration_rate=0.0, is_respiring=False, temperature_c=25.0,
    relative_humidity_pct=65.0, target_shelf_life_days=180
)
print(f"Rule Engine OK -> WVTR max: {barrier.max_wvtr_g_m2_day}, OTR max: {barrier.max_otr_cc_m2_day}")

print("[2/5] Testing Database Seeding...")
from app.database import engine, Base, SessionLocal
from app.data.seed_data import seed_database
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_database(db)
print("Database Seed OK")

print("[3/5] Testing ML Predictor...")
from app.services.ml_engine import ml_predictor
ml_res = ml_predictor.predict_barrier_targets(
    moisture_pct=2.0, fat_pct=34.0, ph=5.8, water_activity=0.20,
    respiration_rate=0.0, is_respiring=False, temperature_c=25.0,
    relative_humidity_pct=65.0, target_shelf_life_days=180
)
print(f"ML Engine OK -> {ml_res}")

print("[4/5] Testing What-If Simulator...")
from app.services.simulator import what_if_simulator
from app.schemas.recommendation import SimulationRequest
sim_req = SimulationRequest(
    food_name="Potato Chips",
    base_properties={"moisture_pct": 2.0, "fat_pct": 34.0, "water_activity": 0.20, "respiration_rate": 0.0},
    temperature_c=35.0, relative_humidity_pct=80.0, target_shelf_life_days=180
)
sim_res = what_if_simulator.run_simulation(sim_req, db)
print(f"Simulator OK -> Accel factor: {sim_res.arrhenius_acceleration_factor}x, Rec: {sim_res.recommended_material_name}")

print("[5/5] Testing Hybrid Recommender (Async)...")
import asyncio
from app.services.recommender import hybrid_recommender
from app.schemas.recommendation import RecommendationRequest
async def test_rec():
    req = RecommendationRequest(
        food_name="Potato Chips / Crisps",
        category="Dry Snacks",
        storage_type="ambient",
        temperature_c=25.0,
        relative_humidity_pct=60.0,
        target_shelf_life_days=180
    )
    res = await hybrid_recommender.generate_recommendation(req, db)
    print(f"Recommender OK -> Primary: {res.primary_recommendation.name} ({res.primary_recommendation.layer_description})")
    print(f"Shelf Life: {res.estimated_shelf_life_days} days ({res.shelf_life_status})")
    print(f"Why count: {len(res.why_explanations)}, Alternatives: {len(res.alternatives)}")

asyncio.run(test_rec())

print("\nALL BACKEND MODULES VERIFIED SUCCESSFULLY!")
