# backend/moon/calendar.py
from datetime import date
from .logic import get_moon_data
from .phases import moon_age, phase_name, illumination


def get_ui_moon_data(date_str: str, lat=None, lon=None):
    """
    Adapter: converts raw astronomy data → clean UI data
    """

    # ---- Call authoritative astronomy logic ----
    data = get_moon_data(
        location_name="Custom Location",
        date_str=date_str,
        latitude=lat,
        longitude=lon,
    )

    # ---- SAFETY CHECK ----
    if "error" in data:
        return data

    # ---- UI-FRIENDLY RESPONSE ----
    return {
        "date": data.get("date", date_str),
        "day": data.get("day_name"),
        "phase": data.get("phase_name"),
        "illumination": data.get("phase_percent"),
        "age": data.get("moon_age_days"),
        "distance_km": data.get("distance_km"),
        "constellation": data.get("constellation"),
        "paksha": data.get("paksha"),
        "tithi_index": data.get("tithi_index"),
        "event": data.get("event"),
        "solar_eclipse": data.get("solar_eclipse"),
        "lunar_eclipse": data.get("lunar_eclipse"),
        "phase_angle": data.get("tithi_index") * 12.0,
    }
