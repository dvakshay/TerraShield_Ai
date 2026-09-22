def classify_risk(score: float) -> str:
    if score < 30:
        return "LOW"

    if score < 50:
        return "MODERATE"

    if score < 70:
        return "HIGH"

    return "CRITICAL"


def calculate_landslide_risk(
    rainfall_intensity: float,
    rainfall_24h: float,
    soil_moisture: float,
    slope: float,
    historical_landslides: int
) -> float:

    rainfall_score = min(rainfall_intensity / 100 * 30, 30)

    accumulation_score = min(rainfall_24h / 200 * 20, 20)

    moisture_score = soil_moisture / 100 * 20

    slope_score = min(slope / 45 * 20, 20)

    historical_score = min(historical_landslides / 10 * 10, 10)

    score = (
        rainfall_score
        + accumulation_score
        + moisture_score
        + slope_score
        + historical_score
    )

    return round(min(score, 100), 2)


def calculate_flood_risk(
    rainfall_intensity: float,
    rainfall_24h: float,
    soil_moisture: float,
    historical_floods: int
) -> float:

    rainfall_score = min(rainfall_intensity / 100 * 40, 40)

    accumulation_score = min(rainfall_24h / 200 * 30, 30)

    moisture_score = soil_moisture / 100 * 20

    historical_score = min(historical_floods / 10 * 10, 10)

    score = (
        rainfall_score
        + accumulation_score
        + moisture_score
        + historical_score
    )

    return round(min(score, 100), 2)


def calculate_overall_risk(
    landslide_risk: float,
    flood_risk: float
) -> float:

    return round(
        (landslide_risk * 0.55) +
        (flood_risk * 0.45),
        2
    )


def get_recommended_action(overall_risk: float) -> str:

    if overall_risk < 30:
        return "Continue normal monitoring."

    if overall_risk < 50:
        return "Increase monitoring frequency."

    if overall_risk < 70:
        return "Prepare emergency response teams."

    if overall_risk < 85:
        return "Prepare evacuation of vulnerable zones."

    return "Initiate emergency evacuation protocol."