import pytest
from app.database import SessionLocal, engine, Base
from app.data.seed_data import seed_database
from app.schemas.recommendation import RecommendationRequest
from app.services.recommender import hybrid_recommender
from app.services.report_generator import pdf_report_generator
import asyncio

def test_pdf_generation():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    seed_database(session)
    
    async def _test():
        req = RecommendationRequest(
            food_name="Fresh Strawberries",
            category="Fresh Produce",
            storage_type="refrigerated",
            temperature_c=4.0,
            relative_humidity_pct=90.0,
            target_shelf_life_days=7
        )
        rec = await hybrid_recommender.generate_recommendation(req, session)
        pdf_buf = pdf_report_generator.generate_recommendation_pdf(rec)
        pdf_bytes = pdf_buf.getvalue()
        
        assert len(pdf_bytes) > 1000
        assert pdf_bytes.startswith(b"%PDF")
    
    asyncio.run(_test())
    session.close()
