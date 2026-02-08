import math
from skyfield.api import load
from datetime import datetime

eph = load("de421.bsp")
sun = eph["sun"]
ts = load.timescale()

planet_map = {
    "mercury": eph["mercury"],
    "venus": eph["venus"],
    "earth": eph["earth"],
    "mars": eph["mars"],
    "jupiter": eph["jupiter_barycenter"],
    "saturn": eph["saturn_barycenter"],
    "uranus": eph["uranus_barycenter"],
    "neptune": eph["neptune_barycenter"],
}


def get_positions(date_str=None):
    if date_str:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
    else:
        dt = datetime.now()

    t = ts.utc(dt.year, dt.month, dt.day)
    positions = {}

    for name, body in planet_map.items():
        astrometric = sun.at(t).observe(body)
        x, y, z = astrometric.position.au   

        # 🔹 PROJECT TO CIRCULAR ORBIT SPACE
        r = math.sqrt(x * x + z * z)  # distance in AU
        theta = math.atan2(z, x)  # angle in radians

        positions[name] = {"r": float(r), "theta": float(theta)}

    return positions
