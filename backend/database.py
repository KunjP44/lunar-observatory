import sqlite3
import json


DB_NAME = "lunar.db"


def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS push_tokens (
            token TEXT PRIMARY KEY,
            daily_brief INTEGER DEFAULT 0,
            planet_brief INTEGER DEFAULT 0
        )
    """
    )
    # 🔥 Visibility persistent cache
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS visibility_cache (
            date TEXT PRIMARY KEY,
            data TEXT
        )
        """
    )

    cursor.execute("PRAGMA table_info(push_tokens)")

    columns = [col[1] for col in cursor.fetchall()]

    if "daily_brief" not in columns:
        cursor.execute(
            "ALTER TABLE push_tokens ADD COLUMN daily_brief INTEGER DEFAULT 0"
        )

    if "planet_brief" not in columns:
        cursor.execute(
            "ALTER TABLE push_tokens ADD COLUMN planet_brief INTEGER DEFAULT 0"
        )

    conn.commit()
    conn.close()


def save_token(token: str, daily_brief: bool = False, planet_brief: bool = False):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO push_tokens (token, daily_brief, planet_brief)
        VALUES (?, ?, ?)
        ON CONFLICT(token) DO UPDATE SET
            daily_brief = excluded.daily_brief,
            planet_brief = excluded.planet_brief
    """,
        (token, int(daily_brief), int(planet_brief)),
    )

    conn.commit()
    conn.close()


def get_daily_tokens():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("SELECT token FROM push_tokens WHERE daily_brief = 1")
    tokens = [row[0] for row in cursor.fetchall()]

    conn.close()
    return tokens


def get_planet_tokens():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("SELECT token FROM push_tokens WHERE planet_brief = 1")
    tokens = [row[0] for row in cursor.fetchall()]

    conn.close()
    return tokens


def get_all_tokens():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("SELECT token FROM push_tokens")
    tokens = [row[0] for row in cursor.fetchall()]

    conn.close()
    return tokens


def delete_token(token: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM push_tokens WHERE token = ?", (token,))
    conn.commit()
    conn.close()


def save_visibility(date: str, data: dict):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO visibility_cache (date, data)
        VALUES (?, ?)
        ON CONFLICT(date) DO UPDATE SET
            data = excluded.data
        """,
        (date, json.dumps(data)),
    )

    conn.commit()
    conn.close()


def get_visibility(date: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("SELECT data FROM visibility_cache WHERE date = ?", (date,))
    row = cursor.fetchone()

    conn.close()

    if row:
        return json.loads(row[0])

    return None


def get_cached_dates():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("SELECT date FROM visibility_cache")
    dates = [row[0] for row in cursor.fetchall()]

    conn.close()
    return dates


def cleanup_old_visibility(keep_days: int = 30):
    from datetime import date, timedelta

    cutoff_date = (date.today() - timedelta(days=keep_days)).isoformat()

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM visibility_cache WHERE date < ?", (cutoff_date,))

    conn.commit()
    conn.close()
