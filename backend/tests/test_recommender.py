import pytest
from app.database import SessionLocal, engine, Base
from app.data.seed_data import seed_database
from app.schemas.recommendation import RecommendationRequest
from app.services.recommender import hybrid_recommender

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    seed_database(session)
    yield session
    session.close()

import asyncio

def test_recommendation_pipeline(db_session):
    async def _test():
        req = RecommendationRequest(
            food_name="Potato Chips / Crisps",
            category="Dry Snacks",
            storage_type="ambient",
            temperature_c=25.0,
            relative_humidity_pct=60.0,
            target_shelf_life_days=180,
            budget_priority="balanced",
            sustainability_priority="standard"
        )
        res = await hybrid_recommender.generate_recommendation(req, db_session)
        
        assert res.food_name == "Potato Chips / Crisps"
        assert res.primary_recommendation.wvtr_g_m2_day <= 3.0
        assert len(res.why_explanations) > 0
        assert len(res.alternatives) > 0
        assert "moisture_pct" in res.provenance
        assert res.scores["barrier_score"] > 0

    asyncio.run(_test())
