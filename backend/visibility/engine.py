# backend/visibility/engine.py

from datetime import datetime, timedelta, date
from skyfield.api import load, wgs84
import numpy as np

# 🇮🇳 Ahmedabad Observer (Fixed for now)
INDIA_LAT = 23.0225
INDIA_LON = 72.5714

eph = None
ts = None
earth = None
sun = None
PLANETS = None

VISIBILITY_CACHE = {}


def get_skyfield():
    global eph, ts, earth, sun, PLANETS

    if eph is None:
        eph = load("de421.bsp")
        ts = load.timescale(builtin=True)

        earth = eph["earth"]
        sun = eph["sun"]

        PLANETS = {
            "mercury": eph["mercury"],
            "venus": eph["venus"],
            "mars": eph["mars"],
            "jupiter": eph["jupiter_barycenter"],
            "saturn": eph["saturn_barycenter"],
        }

    return eph, ts, earth, sun, PLANETS


PLANET_MAGNITUDES = {
    "mercury": -0.4,
    "venus": -4.0,
    "mars": -1.5,
    "jupiter": -2.7,
    "saturn": 0.5,
}


def to_ist_string(t):
    dt = t.utc_datetime() + timedelta(hours=5, minutes=30)
    return dt.strftime("%H:%M")


def compute_visibility(date_str: str):

    eph, ts, earth, sun, PLANETS = get_skyfield()

    d = datetime.strptime(date_str, "%Y-%m-%d")
    observer = earth + wgs84.latlon(INDIA_LAT, INDIA_LON)

    # Generate times every 10 minutes
    times = [
        ts.utc(d.year, d.month, d.day, hour, minute)
        for hour in range(24)
        for minute in range(0, 60, 10)
    ]

    results = {}

    for name, body in PLANETS.items():

        altitudes = []
        sun_alts = []
        azimuths = []

        magnitude = PLANET_MAGNITUDES.get(name)

        for t in times:
            astrometric = observer.at(t).observe(body)
            alt, az, distance = astrometric.apparent().altaz()
            altitudes.append(alt.degrees)
            azimuths.append(az.degrees)

            sun_alt = observer.at(t).observe(sun).apparent().altaz()[0].degrees
            sun_alts.append(sun_alt)

        altitudes = np.array(altitudes)
        sun_alts = np.array(sun_alts)
        azimuths = np.array(azimuths)
        # Best viewing window mask
        best_mask = (altitudes > 20) & (sun_alts < -12)

        # Rise = first altitude > 0
        rise_idx = np.where(altitudes > 0)[0]
        if len(rise_idx) == 0:
            results[name] = {
                "visible": False,
                "rise": None,
                "set": None,
                "transit": None,
                "max_altitude": None,
                "azimuth": None,
                "magnitude": magnitude,
                "visible_after_sunset": False,
                "best_view_window": None,
                "visibility_rating": "Poor",
            }
            continue
        rise_time = times[rise_idx[0]]
        set_time = times[rise_idx[-1]]

        max_idx = np.argmax(altitudes)
        transit_time = times[max_idx]
        max_altitude = float(round(altitudes[max_idx], 2))
        transit_azimuth = float(round(azimuths[max_idx], 2))

        # Visible after sunset logic
        visible_mask = (altitudes > 10) & (sun_alts < -6)
        visible_after_sunset = bool(np.any(visible_mask))
        if np.any(best_mask):
            indices = np.where(best_mask)[0]
            start_idx = indices[0]
            end_idx = indices[-1]

            best_start = to_ist_string(times[start_idx])
            best_end = to_ist_string(times[end_idx])
            best_window = f"{best_start} – {best_end}"
        else:
            best_window = None

        # Visibility Rating Logic
        if not visible_after_sunset:
            rating = "Poor"
        elif not best_window:
            rating = "Poor"
        elif max_altitude < 35:
            rating = "Good"
        else:
            rating = "Excellent"

        results[name] = {
            "rise": to_ist_string(rise_time),
            "set": to_ist_string(set_time),
            "transit": to_ist_string(transit_time),
            "max_altitude": max_altitude,
            "azimuth": transit_azimuth,
            "magnitude": magnitude,
            "visible_after_sunset": visible_after_sunset,
            "best_view_window": best_window,
            "visibility_rating": rating,
            "visible": True,
        }

    return results
