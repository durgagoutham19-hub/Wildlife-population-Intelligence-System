"""
Wildlife Population Intelligence System - FastAPI Backend
Main application entry point
"""

import os
# Prevent OpenBLAS and multi-threading memory exhaustion on Windows
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import logging
from datetime import datetime

# Import database
from database import engine, Base, get_db
from models import User, UserRole, Species, Survey, MonitoringSite, Device, Observation

# Import routers
from routers import auth, users, surveys, monitoring_sites, devices, observations, species
from routers import image_analysis, audio_analysis, population, biodiversity
from routers import habitat, conservation, gis, reports, admin

# Import schemas
from schemas.auth import TokenResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Wildlife Population Intelligence System",
    description="AI-powered wildlife monitoring and conservation platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS
frontend_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
configured_frontend_url = os.getenv("FRONTEND_URL")
if configured_frontend_url:
    frontend_origins.extend(
        origin.strip()
        for origin in configured_frontend_url.split(",")
        if origin.strip()
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_origin_regex=r"https://.*\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (images, audio, spectrograms, reports)
os.makedirs("uploads/images", exist_ok=True)
os.makedirs("uploads/audio", exist_ok=True)
os.makedirs("uploads/spectrograms", exist_ok=True)
os.makedirs("uploads/reports", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        from sqlalchemy import text
        db = Session(engine)
        db.execute(text("SELECT 1"))
        db.close()
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")

# Ready check endpoint
@app.get("/ready")
async def ready_check():
    """Readiness check endpoint"""
    try:
        from sqlalchemy import text
        db = Session(engine)
        db.execute(text("SELECT 1"))
        db.close()
        return {
            "ready": True,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        logger.error(f"Ready check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service not ready")

# API v1 routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(surveys.router, prefix="/api/v1/surveys", tags=["Surveys"])
app.include_router(monitoring_sites.router, prefix="/api/v1/monitoring-sites", tags=["Monitoring Sites"])
app.include_router(devices.router, prefix="/api/v1/devices", tags=["Devices"])
app.include_router(observations.router, prefix="/api/v1/observations", tags=["Observations"])
app.include_router(species.router, prefix="/api/v1/species", tags=["Species"])

# Phase 2: AI Analysis
app.include_router(image_analysis.router, prefix="/api/v1/image-analysis", tags=["Image Analysis"])
app.include_router(audio_analysis.router, prefix="/api/v1/audio-analysis", tags=["Audio Analysis"])

# Phase 3: Intelligence
app.include_router(population.router, prefix="/api/v1/population", tags=["Population Intelligence"])
app.include_router(biodiversity.router, prefix="/api/v1/biodiversity", tags=["Biodiversity"])
app.include_router(habitat.router, prefix="/api/v1/habitat", tags=["Habitat"])
app.include_router(conservation.router, prefix="/api/v1/conservation", tags=["Conservation"])

# Phase 4: GIS & Reporting
app.include_router(gis.router, prefix="/api/v1/gis", tags=["GIS & Maps"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])

# Admin
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Administration"])

@app.on_event("startup")
async def startup_event():
    """Startup event"""
    logger.info("=" * 50)
    logger.info("Wildlife Population Intelligence System Starting")
    logger.info("=" * 50)
    logger.info("API Documentation: http://localhost:8000/docs")
    logger.info("ReDoc: http://localhost:8000/redoc")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event"""
    logger.info("=" * 50)
    logger.info("Wildlife Population Intelligence System Shutting Down")
    logger.info("=" * 50)

# Serve built frontend in production if dist directory exists
frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API, Docs, Uploads or Health routes
        if full_path.startswith(("api/", "docs", "redoc", "openapi.json", "uploads/", "health", "ready")):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Frontend build not found"}
else:
    # Root endpoint for API only mode
    @app.get("/")
    async def root():
        """Root endpoint"""
        return {
            "message": "Wildlife Population Intelligence System API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/health"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
