from fastapi import FastAPI

from app.models.risk import RiskInput, RiskResponse
from app.services.risk_engine import (
    calculate_landslide_risk,
    calculate_flood_risk,
    calculate_overall_risk,
    classify_risk,
    get_recommended_action
)


app = FastAPI(
    title="TerraShield AI",
    description="Hyper-local Landslide and Flash-Flood Early Warning System",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "system": "TerraShield AI",
        "status": "online",
        "message": "Disaster intelligence system operational"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/predict", response_model=RiskResponse)
def predict_risk(data: RiskInput):

    landslide_risk = calculate_landslide_risk(
        data.rainfall_intensity,
        data.rainfall_24h,
        data.soil_moisture,
        data.slope,
        data.historical_landslides
    )

    flood_risk = calculate_flood_risk(
        data.rainfall_intensity,
        data.rainfall_24h,
        data.soil_moisture,
        data.historical_floods
    )

    overall_risk = calculate_overall_risk(
        landslide_risk,
        flood_risk
    )

    return RiskResponse(
        landslide_risk=landslide_risk,
        flood_risk=flood_risk,
        overall_risk=overall_risk,

        landslide_level=classify_risk(landslide_risk),
        flood_level=classify_risk(flood_risk),
        overall_level=classify_risk(overall_risk),

        recommended_action=get_recommended_action(overall_risk)
    )