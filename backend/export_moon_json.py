import json
from datetime import date, timedelta
from pathlib import Path

from moon.logic import get_moon_data

BASE_DIR = Path(__file__).resolve().parent.parent
OUT_DIR = BASE_DIR / "frontend" / "public" / "data" / "moon"

print("Moon JSON will be written to:", OUT_DIR)
OUT_DIR.mkdir(parents=True, exist_ok=True)

print("Script running from:", Path.cwd())

start = date(2024, 1, 1)
end = date(2027, 12, 31)

d = start
while d <= end:

    data = get_moon_data(location_name="Earth", date_str=d.isoformat())

    payload = {
        "date": d.isoformat(),
        "phase": data["phase_name"],
        "phase_angle": round((data["moon_age_days"] / 29.530588) * 360.0, 2),
        "illumination": data["phase_percent"],
        "age": data["moon_age_days"],
        "paksha": data["paksha"],
        "constellation": data["constellation"],
        "distance_km": data["distance_km"],
        "event": data["event"],
        "solar_eclipse": data["solar_eclipse"],
        "lunar_eclipse": data["lunar_eclipse"],
    }

    with open(OUT_DIR / f"{d.isoformat()}.json", "w") as f:
        json.dump(payload, f, indent=2)

    d += timedelta(days=1)

print("✅ Moon JSON export complete")
