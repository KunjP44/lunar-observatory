import math
from skyfield.api import load
from datetime import datetime

eph = load("de421.bsp")
sun = eph["sun"]
ts = load.timescale()

# Define bodies
planet_map = {
    "mercury": eph["mercury"],
    "venus": eph["venus"],
    "earth": eph["earth"],
    "mars": eph["mars"],
    "jupiter": eph["jupiter_barycenter"],
    "saturn": eph["saturn_barycenter"],
    "uranus": eph["uranus_barycenter"],
    "neptune": eph["neptune_barycenter"],
    "moon": eph["moon"],
}


def get_positions(date_str=None):
    if date_str:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
    else:
        # CRITICAL FIX: Use UTC time, not Local time
        dt = datetime.utcnow()

    # Pass the hours/minutes to get precise rotation
    t = ts.utc(dt.year, dt.month, dt.day, dt.hour, dt.minute)
    positions = {}

    # 1. PLANETS
    for name, body in planet_map.items():
        if name == "moon":
            continue

        astrometric = sun.at(t).observe(body)
        x, y, z = astrometric.position.au

        # Flat plane angle (Skyfield X/Y -> Scene X/Z)
        r = math.sqrt(x * x + y * y + z * z)
        theta = math.atan2(y, x)

        positions[name] = {"r": float(r), "theta": float(theta)}

    # 2. MOON (Relative to Earth)
    # FIX: Use brackets ["earth"] to avoid syntax errors
    earth = planet_map["earth"]
    moon = planet_map["moon"]

    astrometric_moon = earth.at(t).observe(moon)
    mx, my, mz = astrometric_moon.position.km

    # Calculate angle in X-Y plane
    moon_theta = math.atan2(my, mx)
    positions["Moon"] = {"theta": float(moon_theta)}

    # 3. EARTH ROTATION (GAST)
    gast_hours = t.gast

    # Convert to radians
    earth_rotation = (gast_hours / 24.0) * 2 * math.pi

    positions["Earth_Rotation"] = float(earth_rotation)

    return positions
