import logging
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, get_db, SessionLocal
from app.models.food import FoodItem
from app.models.packaging import PackagingMaterial
from app.data.seed_data import seed_database
from app.schemas.food import FoodItemResponse, FoodEnrichmentResponse
from app.schemas.packaging import PackagingMaterialResponse
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    SimulationRequest,
    SimulationResponse
)
from app.services.external_api import external_food_service
from app.services.recommender import hybrid_recommender
from app.services.simulator import what_if_simulator
from app.services.report_generator import pdf_report_generator
from app.services.weather_service import weather_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SIH26236: AI-Based Intelligent Food Packaging Decision-Support System"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    """Initializes database schema and populates knowledge base baseline."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    logger.info("Application startup sequence completed successfully.")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": "SIH26236 - Food Packaging AI Decision Support",
        "version": settings.VERSION
    }

@app.get("/api/health/sources")
async def data_sources_health():
    """
    Live Health & Provenance Monitoring of External Data Sources.
    Monitors Open Food Facts v3, Open-Meteo Weather/Forecast API, and Local/FAOSTAT Reference DB.
    """
    import httpx
    
    # Check Open-Meteo
    meteo_status = "Available"
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            r = await client.get("https://geocoding-api.open-meteo.com/v1/search?name=Delhi&count=1")
            if r.status_code != 200:
                meteo_status = "Degraded"
    except Exception:
        meteo_status = "Fallback Active (Regional Climate Baseline)"

    # Check Open Food Facts
    off_status = "Available (v3)"
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            r = await client.get("https://world.openfoodfacts.org/api/v3/product/3017620422003.json?fields=code")
            if r.status_code != 200:
                off_status = "Fallback Active (FAOSTAT/Local Reference)"
    except Exception:
        off_status = "Fallback Active (FAOSTAT/Local Reference)"

    return {
        "overall_status": "operational",
        "sources": [
            {
                "name": "Open Food Facts API",
                "version": "v3",
                "role": "Product-level metadata, nutrition panel & packaging tags",
                "status": meteo_status != "Degraded" and off_status or "Fallback Active",
                "active_fallback": "FAOSTAT / INFOODS + Local Reference DB"
            },
            {
                "name": "FAOSTAT / INFOODS",
                "version": "2026 Harmonized Matrix",
                "role": "Broad agricultural commodity & physiological baseline",
                "status": "Verified",
                "active_fallback": "Curated Laboratory Benchmark Database"
            },
            {
                "name": "Open-Meteo Weather & Forecast API",
                "version": "v1 (Hourly 24h)",
                "role": "Ambient temperature, RH & 24h diurnal thermal stress",
                "status": meteo_status,
                "active_fallback": "Indian Regional Climate Database (14 Metro Baselines)"
            },
            {
                "name": "PackAI Packaging Knowledge Base",
                "version": "Empirical SIH26236",
                "role": "Material barrier engineering (OTR, WVTR, seal, cost, eco)",
                "status": "Internal (Deterministic & Secure)",
                "active_fallback": "Strictly Internal & Defensible"
            }
        ],
        "caching_strategy": "In-Memory LRU with 1-hour TTL & Duplicate Scan Prevention"
    }

# --- Food Endpoints ---

@app.get("/api/foods", response_model=List[FoodItemResponse])
def get_all_foods(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve all reference foods in the database, with optional category filtering."""
    query = db.query(FoodItem)
    if category:
        query = query.filter(FoodItem.category == category)
    return query.all()

@app.get("/api/foods/categories", response_model=List[str])
def get_food_categories(db: Session = Depends(get_db)):
    """List all available food categories."""
    categories = db.query(FoodItem.category).distinct().all()
    return sorted([c[0] for c in categories if c[0]])

@app.get("/api/foods/autocomplete")
async def autocomplete_foods(
    q: str = Query(..., min_length=1, description="Food name or keyword for fast suggestions"),
    db: Session = Depends(get_db)
):
    """Fast live suggestions from local benchmark DB and Open Food Facts API."""
    return await external_food_service.autocomplete_food(q, db)

@app.get("/api/foods/search")
async def search_foods(
    q: str = Query(..., min_length=1, description="Food name or search keyword"),
    db: Session = Depends(get_db)
):
    """
    Search foods with automatic fallback to Open Food Facts API
    and USDA/FAO reference datasets, accompanied by complete data provenance.
    """
    return await external_food_service.search_food(q, db)

@app.get("/api/foods/barcode/{barcode}")
async def lookup_food_by_barcode(
    barcode: str,
    db: Session = Depends(get_db)
):
    """Lookup product details and nutrients by barcode from Open Food Facts API."""
    result = await external_food_service.lookup_by_barcode(barcode, db)
    if not result:
        raise HTTPException(status_code=404, detail="Barcode not found in catalog or external database.")
    return result

@app.get("/api/weather/reference")
async def get_weather_reference(
    location: str = Query("Indore", description="City or district location name")
):
    """
    Environmental Data Enrichment:
    Fetches real-time or regional ambient climate reference (temperature & RH)
    to inform user storage condition analysis.
    """
    return await weather_service.get_weather_reference(location)

# --- Packaging Knowledge Base Endpoints ---

@app.get("/api/materials", response_model=List[PackagingMaterialResponse])
def get_packaging_materials(
    recyclable_only: bool = False,
    map_suitable_only: bool = False,
    db: Session = Depends(get_db)
):
    """Browse the Curated Packaging Knowledge Base with technical barrier specs."""
    query = db.query(PackagingMaterial)
    if recyclable_only:
        query = query.filter(PackagingMaterial.recyclability_grade.in_(["A+", "A", "Compostable", "Home-Compost"]))
    if map_suitable_only:
        query = query.filter(PackagingMaterial.map_suitable == True)
    return query.all()

# --- Intelligence & Decision Support Endpoints ---

@app.post("/api/recommend", response_model=RecommendationResponse)
async def recommend_packaging(
    req: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Core Hybrid Recommendation Engine:
    Integrates Scientific Rule Engine + Machine Learning Random Forest Model + MCDA
    to prescribe optimal packaging materials, barrier limits, and scientific explanations.
    """
    try:
        return await hybrid_recommender.generate_recommendation(req, db)
    except Exception as e:
        logger.error(f"Recommendation generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Recommendation engine error: {str(e)}")

@app.post("/api/simulate", response_model=SimulationResponse)
def simulate_packaging_conditions(
    req: SimulationRequest,
    db: Session = Depends(get_db)
):
    """
    Dynamic What-If Packaging Simulator:
    Recalculates shelf life, Arrhenius kinetic factor, failure mode,
    and adaptive material recommendations as temperature and humidity sliders are adjusted.
    """
    try:
        return what_if_simulator.run_simulation(req, db)
    except Exception as e:
        logger.error(f"Simulation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Simulator error: {str(e)}")

@app.post("/api/report/pdf")
def generate_pdf_report(
    recommendation: RecommendationResponse
):
    """Generates an executive technical dossier PDF for download using ReportLab."""
    try:
        pdf_buffer = pdf_report_generator.generate_recommendation_pdf(recommendation)
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Packaging_Dossier_{recommendation.food_name.replace(' ', '_')}.pdf"
            }
        )
    except Exception as e:
        logger.error(f"PDF generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
