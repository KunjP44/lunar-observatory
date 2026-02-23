import sqlite3

DB_NAME = "lunar.db"


def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS push_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT UNIQUE
        )
    """
    )

    conn.commit()
    conn.close()


def save_token(token: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT OR IGNORE INTO push_tokens (token) VALUES (?)", (token,))
        conn.commit()
    finally:
        conn.close()


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
