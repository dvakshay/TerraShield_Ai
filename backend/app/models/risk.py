from pydantic import BaseModel, Field


class RiskInput(BaseModel):
    rainfall_intensity: float = Field(
        ..., ge=0, description="Rainfall intensity in mm/hr"
    )

    rainfall_24h: float = Field(
        ..., ge=0, description="24-hour accumulated rainfall in mm"
    )

    soil_moisture: float = Field(
        ..., ge=0, le=100, description="Soil moisture percentage"
    )

    slope: float = Field(
        ..., ge=0, le=90, description="Terrain slope in degrees"
    )

    historical_landslides: int = Field(
        ..., ge=0, description="Historical landslide events"
    )

    historical_floods: int = Field(
        ..., ge=0, description="Historical flood events"
    )


class RiskResponse(BaseModel):
    landslide_risk: float
    flood_risk: float
    overall_risk: float

    landslide_level: str
    flood_level: str
    overall_level: str

    recommended_action: str