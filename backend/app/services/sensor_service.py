from datetime import datetime, timezone
import math


def generate_sensor_reading(location):

    # Current time
    now = datetime.now(timezone.utc)

    # Creates a smooth changing value every few minutes.
    # This simulates changing environmental conditions.
    time_factor = now.minute + (now.second / 60)

    variation = math.sin(time_factor / 5)

    rainfall = location["rainfall_intensity"] + (variation * 8)

    soil_moisture = location["soil_moisture"] + (variation * 3)

    slope = location["slope"] + (variation * 0.5)

    rainfall = round(max(rainfall, 0), 2)
    soil_moisture = round(
        min(max(soil_moisture, 0), 100),
        2
    )
    slope = round(max(slope, 0), 2)

    return {
        "location_id": location["id"],
        "timestamp": now.isoformat(),

        "rainfall_intensity": rainfall,
        "soil_moisture": soil_moisture,
        "slope": slope,

        "sensor_status": "ONLINE"
    }
