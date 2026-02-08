import swisseph as swe
from geopy.geocoders import Nominatim
from datetime import datetime, timezone, timedelta, date
import math
import os

# Constants
SYNODIC_MONTH = 29.530588

TITHI_NAMES_SHUKLA = {
    1: "Shukla Pratipada",
    2: "Shukla Dwitiya",
    3: "Shukla Tritiya",
    4: "Shukla Chaturthi",
    5: "Shukla Panchami",
    6: "Shukla Shashthi",
    7: "Shukla Saptami",
    8: "Shukla Ashtami",
    9: "Shukla Navami",
    10: "Shukla Dashami",
    11: "Shukla Ekadashi",
    12: "Shukla Dwadashi",
    13: "Shukla Trayodashi",
    14: "Shukla Chaturdashi",
    15: "Purnima",
}

TITHI_NAMES_KRISHNA = {
    1: "Krishna Pratipada",
    2: "Krishna Dwitiya",
    3: "Krishna Tritiya",
    4: "Krishna Chaturthi",
    5: "Krishna Panchami",
    6: "Krishna Shashthi",
    7: "Krishna Saptami",
    8: "Krishna Ashtami",
    9: "Krishna Navami",
    10: "Krishna Dashami",
    11: "Krishna Ekadashi",
    12: "Krishna Dwadashi",
    13: "Krishna Trayodashi",
    14: "Krishna Chaturdashi",
    15: "Amavasya",
}

NAKSHATRAS = [
    "Ashwini",
    "Bharani",
    "Krittika",
    "Rohini",
    "Mrigashirsha",
    "Ardra",
    "Punarvasu",
    "Pushya",
    "Ashlesha",
    "Magha",
    "Purva Phalguni",
    "Uttara Phalguni",
    "Hasta",
    "Chitra",
    "Swati",
    "Vishakha",
    "Anuradha",
    "Jyeshtha",
    "Mula",
    "Purva Ashadha",
    "Uttara Ashadha",
    "Shravana",
    "Dhanishta",
    "Shatabhisha",
    "Purva Bhadrapada",
    "Uttara Bhadrapada",
    "Revati",
]

RISHI_NAMES = [
    "Mesha (Aries)",
    "Vrishabha (Taurus)",
    "Mithuna (Gemini)",
    "Karka (Cancer)",
    "Simha (Leo)",
    "Kanya (Virgo)",
    "Tula (Libra)",
    "Vrishchika (Scorpio)",
    "Dhanu (Sagittarius)",
    "Makara (Capricorn)",
    "Kumbha (Aqarius)",
    "Meena (Pisces)",
]


def datetime_to_julian_day(dt: datetime) -> float:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    dt = dt.astimezone(timezone.utc)
    return swe.julday(
        dt.year, dt.month, dt.day, dt.hour + dt.minute / 60.0 + dt.second / 3600.0
    )


def sun_moon_longitudes(jd_ut: float):
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
    sun_res = swe.calc_ut(jd_ut, swe.SUN, flags)
    moon_res = swe.calc_ut(jd_ut, swe.MOON, flags)

    def extract_lon(res):
        r0 = res[0]
        if isinstance(r0, (list, tuple)):
            return float(r0[0])
        return float(r0)

    lon_sun = extract_lon(sun_res) % 360.0
    lon_moon = extract_lon(moon_res) % 360.0

    dist_val = moon_res[0][2] if isinstance(moon_res[0], (list, tuple)) else moon_res[2]
    moon_dist_km = dist_val * 149597870.7
    lat_val = moon_res[0][1] if isinstance(moon_res[0], (list, tuple)) else moon_res[1]

    return lon_sun, lon_moon, lat_val, moon_dist_km


def get_nakshatra(lon_moon: float):
    return NAKSHATRAS[int(lon_moon / (360.0 / 27.0)) % 27]


def get_rashi(lon_moon: float):
    return RISHI_NAMES[int(lon_moon / 30.0) % 12]


def tithi_from_longitudes(lon_sun: float, lon_moon: float):
    diff = (lon_moon - lon_sun) % 360.0
    tithi_index = int(math.floor(diff / 12.0)) + 1
    if tithi_index <= 15:
        paksha = "Shukla"
        name = TITHI_NAMES_SHUKLA[tithi_index]
    else:
        paksha = "Krishna"
        name = TITHI_NAMES_KRISHNA[tithi_index - 15]
    return tithi_index, paksha, name, diff


def illumination_from_phase_angle(diff_deg: float) -> float:
    phase_angle = math.radians(diff_deg)
    return ((1.0 - math.cos(phase_angle)) / 2.0) * 100.0


def approximate_moon_age(diff_deg: float) -> float:
    return ((diff_deg % 360.0) / 360.0) * SYNODIC_MONTH


def classify_moon_event(
    phase_percent: float, distance_btn: float, tithi_idx: int, paksha: str
):
    """
    Classify Special lunar events based on Phase, Distance AND Tithi.
    Refined to strictly pick the 'Peak Day' (Purnima/Amavasya).
    """

    # CASE 1: SUPERMOON (Perigee)
    # Must be < 360,000 km
    if distance_btn <= 360000:
        # Full Supermoon (Visible) -> Must be Purnima (Shukla 15)
        if tithi_idx == 15 and paksha == "Shukla":
            return "supermoon"

    # CASE 2: MICROMOON (Apogee)
    # Must be > 405,000 km
    elif distance_btn >= 405000:
        # Full Micromoon -> Purnima
        if tithi_idx == 15 and paksha == "Shukla":
            return "micromoon"

    return None


# --- FIXED: ECLIPSE VISIBILITY LOGIC (Wider Time Window) ---
def is_eclipse_visible(jd_max, lat, lon):
    swe.set_topo(lon, lat, 0)
    # Check Max, Max-2h, Max+2h to catch moonrise visibility
    offsets = [0, -0.083, 0.083]

    for dt in offsets:
        t_check = jd_max + dt
        moon_pos = swe.calc_ut(t_check, swe.MOON, swe.FLG_SWIEPH | swe.FLG_EQUATORIAL)
        ra, dec = moon_pos[0][0], moon_pos[0][1]
        _, alt, _ = swe.azalt(t_check, swe.ECL2HOR, [lon, lat, 0], 0, 0, [ra, dec, 1])
        if alt > -0.5:  # Allow for refraction
            return True
    return False


def normalize_lon(lon):
    lon = lon % 360
    if lon > 180:
        lon -= 360
    return lon


def approximate_visible_regions(jd_max):
    sun = swe.calc_ut(jd_max, swe.SUN, swe.FLG_SWIEPH)[0][0]
    sun = normalize_lon(sun)
    night_center_lon = normalize_lon(sun + 180)
    REGIONS = [
        ("Americas", -170, -30),
        ("Europe & Africa", -30, 60),
        ("Asia", 60, 150),
        ("Australia & Pacific", 150, -170),
    ]
    visible = []
    for name, lon_min, lon_max in REGIONS:
        if lon_min <= lon_max:
            overlap = (
                lon_max >= night_center_lon - 120 and lon_min <= night_center_lon + 120
            )
        else:
            overlap = (
                lon_max >= night_center_lon - 120 or lon_min <= night_center_lon + 120
            )
        if overlap:
            visible.append(name)
    return visible


def approximate_solar_visible_regions(jd_max):
    sun = swe.calc_ut(jd_max, swe.SUN, swe.FLG_SWIEPH)[0][0]
    sun = normalize_lon(sun)
    day_center_lon = sun
    REGIONS = [
        ("Americas", -170, -30),
        ("Europe & Africa", -30, 60),
        ("Asia", 60, 150),
        ("Australia & Pacific", 150, -170),
    ]
    visible = []
    for name, lon_min, lon_max in REGIONS:
        if lon_min <= lon_max:
            overlap = lon_max >= day_center_lon - 60 and lon_min <= day_center_lon + 60
        else:
            overlap = lon_max >= day_center_lon - 60 or lon_min <= day_center_lon + 60
        if overlap:
            visible.append(name)
    return visible


def get_exact_eclipse_observer(date_obj, lat, lon):
    swe.set_sid_mode(0)
    jd0 = swe.julday(date_obj.year, date_obj.month, date_obj.day, 0.0)
    res = swe.lun_eclipse_when(jd0 - 0.5, swe.FLG_SWIEPH, 0)
    if res[0] < 0:
        return None
    jd_max = res[1][0]
    y, m, d, h = swe.revjul(jd_max, swe.GREG_CAL)
    if datetime(y, m, d).date() != date_obj.date():
        return None
    attr = swe.lun_eclipse_how(jd_max, [0, 0, 0], swe.FLG_SWIEPH)
    mag = attr[1][0]
    if mag >= 1.0:
        eclipse_type = "total"
    elif mag > 0.0:
        eclipse_type = "partial"
    else:
        eclipse_type = "penumbral"

    visible_here = is_eclipse_visible(jd_max, lat, lon)
    visible_regions = approximate_visible_regions(jd_max)
    return {
        "type": eclipse_type,
        "visible_here": visible_here,
        "visibility_note": (
            "Visible from this location"
            if visible_here
            else "Not visible from this location"
        ),
        "global_visibility": visible_regions,
        "jd_max": jd_max,
    }


def local_datetime_to_utc(year, month, day, hour, minute, tz_offset_hours=5.5):
    local_tz = timezone(timedelta(hours=tz_offset_hours))
    return datetime(year, month, day, hour, minute, tzinfo=local_tz).astimezone(
        timezone.utc
    )


def get_exact_solar_eclipse_observer(date_obj, lat, lon):
    swe.set_sid_mode(0)
    jd0 = swe.julday(date_obj.year, date_obj.month, date_obj.day, 0.0)
    res = swe.sol_eclipse_when_glob(jd0 - 1, swe.FLG_SWIEPH)
    if res[0] < 0:
        return None
    jd_max = res[1][0]
    y, m, d, _ = swe.revjul(jd_max, swe.GREG_CAL)
    if date(y, m, d) != date_obj.date():
        return None
    res2 = swe.sol_eclipse_how(jd_max, [lon, lat, 0], swe.FLG_SWIEPH)
    eclipse_mag = res2[1][0]
    if eclipse_mag >= 1.0:
        eclipse_type = "total"
    elif eclipse_mag > 0.0:
        eclipse_type = "partial"
    else:
        eclipse_type = "annular"
    swe.set_topo(lon, lat, 0)
    sun = swe.calc_ut(jd_max, swe.SUN, swe.FLG_SWIEPH | swe.FLG_EQUATORIAL)
    ra, dec = sun[0][0], sun[0][1]
    _, alt, _ = swe.azalt(jd_max, swe.ECL2HOR, [lon, lat, 0], 0, 0, [ra, dec, 1])
    visible_here = alt > 0 and eclipse_mag > 0
    visible_regions = approximate_solar_visible_regions(jd_max)
    return {
        "type": eclipse_type,
        "visible_here": visible_here,
        "visibility_note": (
            "Visible from this location"
            if visible_here
            else "Not visible from this location"
        ),
        "global_visibility": visible_regions,
        "jd_max": jd_max,
    }


def get_moon_data(
    location_name: str,
    date_str: str,
    hour=6,
    minute=0,
    tz_offset=5.5,
    calculate_at_sunrise=True,
    latitude=None,
    longitude=None,
):
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    if latitude is None or longitude is None:
        # Default to Earth center (neutral observer)
        latitude = 0.0
        longitude = 0.0
        location_address = "Earth (Geocentric)"
    else:
        location_address = location_name

    try:
        if "-" in date_str:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        elif "/" in date_str:
            date_obj = datetime.strptime(date_str, "%Y/%m/%d")
        else:
            return {"error": "Invalid date format."}
    except ValueError:
        return {"error": "Invalid date format."}

    # LOGIC FIX: User can now override sunrise calculation
    calc_hour = 6 if calculate_at_sunrise else hour
    calc_minute = 0 if calculate_at_sunrise else minute

    dt_utc = local_datetime_to_utc(
        date_obj.year, date_obj.month, date_obj.day, calc_hour, calc_minute, tz_offset
    )
    jd_ut = datetime_to_julian_day(dt_utc)

    swe.set_sid_mode(swe.SIDM_LAHIRI)
    lon_sun, lon_moon, lat_moon, dist_km = sun_moon_longitudes(jd_ut)
    tithi_index, paksha, tithi_name, diff = tithi_from_longitudes(lon_sun, lon_moon)
    nakshatra = get_nakshatra(lon_moon)
    rashi = get_rashi(lon_moon)

    # Calculate Visuals (Illumination) always based on ACTUAL time for 3D view
    if calculate_at_sunrise and (hour != 6):
        # ... (Same visual calc logic) ...
        dt_utc_visual = local_datetime_to_utc(
            date_obj.year, date_obj.month, date_obj.day, hour, minute, tz_offset
        )
        jd_ut_visual = datetime_to_julian_day(dt_utc_visual)
        v_lon_sun, v_lon_moon, _, _ = sun_moon_longitudes(jd_ut_visual)
        visual_diff = (v_lon_moon - v_lon_sun) % 360.0
        illum = illumination_from_phase_angle(visual_diff)
        moon_age = approximate_moon_age(visual_diff)
    else:
        illum = illumination_from_phase_angle(diff)
        moon_age = approximate_moon_age(diff)

    # --- FIX START: Pass Tithi & Paksha to Classifier ---
    event_illum = illumination_from_phase_angle(diff)

    # We now pass tithi_index and paksha to ensure it only triggers on the exact day
    event_type = classify_moon_event(event_illum, dist_km, tithi_index, paksha)
    # --- FIX END ---

    swe.set_sid_mode(swe.SIDM_LAHIRI)
    solar_eclipse = get_exact_solar_eclipse_observer(date_obj, latitude, longitude)
    lunar_eclipse = get_exact_eclipse_observer(date_obj, latitude, longitude)

    day_names = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]

    return {
        "location": location_address,
        "latitude": latitude,
        "longitude": longitude,
        "date": date_str,
        "day_name": day_names[date_obj.weekday()],
        "tithi_index": tithi_index,
        "paksha": paksha,
        "phase_name": tithi_name,
        "phase_percent": round(illum, 2),
        "moon_age_days": round(moon_age, 2),
        "distance_km": int(dist_km),
        "constellation": f"{nakshatra} (Nakshatra) · {rashi}",
        "event": event_type,
        "solar_eclipse": solar_eclipse,
        "lunar_eclipse": lunar_eclipse,
        "note": (
            "Tithi calculated at Sunrise (approx)"
            if calculate_at_sunrise
            else "Exact time calculation"
        ),
    }
