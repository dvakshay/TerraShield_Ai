from fastapi import FastAPI

from app.data.locations import locations

from app.models.risk import RiskInput, RiskResponse

from app.services.sensor_service import generate_sensor_reading

from app.services.risk_engine import (
    calculate_landslide_risk,
    calculate_flood_risk,
    calculate_overall_risk,
    classify_risk,
    get_recommended_action
)


# --------------------------------------------------
# APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="TerraShield AI",
    description="Hyper-local Landslide and Flash-Flood Early Warning System",
    version="0.1.0"
)


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "system": "TerraShield AI",
        "status": "online",
        "message": "Disaster intelligence system operational"
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# --------------------------------------------------
# RISK PREDICTION
# --------------------------------------------------

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

        landslide_level=classify_risk(
            landslide_risk
        ),

        flood_level=classify_risk(
            flood_risk
        ),

        overall_level=classify_risk(
            overall_risk
        ),

        recommended_action=get_recommended_action(
            overall_risk
        )
    )


# --------------------------------------------------
# ALL LOCATIONS
# --------------------------------------------------

@app.get("/locations")
def get_locations():

    return {
        "count": len(locations),
        "locations": locations
    }


# --------------------------------------------------
# LOCATION INTELLIGENCE
# --------------------------------------------------

@app.get("/locations/{location_id}")
def get_location(location_id: str):

    for location in locations:

        if location["id"] == location_id:

            landslide_risk = calculate_landslide_risk(
                location["rainfall_intensity"],
                location["rainfall_24h"],
                location["soil_moisture"],
                location["slope"],
                location["historical_landslides"]
            )

            flood_risk = calculate_flood_risk(
                location["rainfall_intensity"],
                location["rainfall_24h"],
                location["soil_moisture"],
                location["historical_floods"]
            )

            overall_risk = calculate_overall_risk(
                landslide_risk,
                flood_risk
            )

            return {

                **location,

                "landslide_risk": landslide_risk,

                "flood_risk": flood_risk,

                "overall_risk": overall_risk,

                "risk_level": classify_risk(
                    overall_risk
                ),

                "recommended_action":
                    get_recommended_action(
                        overall_risk
                    )
            }

    return {
        "error": "Location not found"
    }

@app.get("/sensors/{location_id}")
def get_sensor_reading(location_id: str):

    for location in locations:

        if location["id"] == location_id:

            reading = generate_sensor_reading(location)

            return reading

    return {
        "error": "Location not found"
    }

@app.get("/monitoring/{location_id}")
def get_monitoring_data(location_id: str):

    for location in locations:

        if location["id"] == location_id:

            sensor = generate_sensor_reading(location)

            landslide_risk = calculate_landslide_risk(
                sensor["rainfall_intensity"],
                location["rainfall_24h"],
                sensor["soil_moisture"],
                sensor["slope"],
                location["historical_landslides"]
            )

            flood_risk = calculate_flood_risk(
                sensor["rainfall_intensity"],
                location["rainfall_24h"],
                sensor["soil_moisture"],
                location["historical_floods"]
            )

            overall_risk = calculate_overall_risk(
                landslide_risk,
                flood_risk
            )

            return {
                "location": {
                    "id": location["id"],
                    "village": location["village"],
                    "district": location["district"],
                    "state": location["state"],
                    "latitude": location["latitude"],
                    "longitude": location["longitude"]
                },

                "sensors": sensor,

                "risk": {
                    "landslide": landslide_risk,
                    "flood": flood_risk,
                    "overall": overall_risk,
                    "level": classify_risk(overall_risk)
                },

                "recommended_action":
                    get_recommended_action(overall_risk)
            }

    return {
        "error": "Location not found"
    }