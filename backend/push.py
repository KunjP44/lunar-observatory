import firebase_admin
from firebase_admin.exceptions import FirebaseError
from firebase_admin import credentials, messaging
import os
import json

from backend.database import (
    save_token,
    get_all_tokens,
    delete_token,
    get_daily_tokens,
    get_planet_tokens,
)

# Initialize Firebase once
if not firebase_admin._apps:
    firebase_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT")

    if firebase_json:
        # Cloud mode (Render)
        cred_dict = json.loads(firebase_json)
        cred = credentials.Certificate(cred_dict)
    else:
        # Local development mode
        cred_path = os.path.join(
            os.path.dirname(__file__), "firebase_service_account.json"
        )
        cred = credentials.Certificate(cred_path)

    firebase_admin.initialize_app(cred)


def register_token(token: str, daily_brief: bool = False, planet_brief: bool = False):
    tokens = get_all_tokens()

    # Remove old tokens with same prefix (same device)
    prefix = token.split(":")[0]

    for t in tokens:
        if t.split(":")[0] == prefix and t != token:
            delete_token(t)

    save_token(token, daily_brief, planet_brief)


def send_notification(title: str, body: str, category: str = "all"):

    if category == "daily":
        tokens = get_daily_tokens()
    elif category == "planet":
        tokens = get_planet_tokens()
    else:
        tokens = get_all_tokens()

    print("Sending to tokens:", tokens)

    for token in tokens:

        message = messaging.Message(
            token=token,
            # 🔹 Android system notification (CRITICAL FIX)
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            # 🔹 Android-specific config
            android=messaging.AndroidConfig(
                priority="high",
                notification=messaging.AndroidNotification(
                    channel_id="default", sound="default"
                ),
            ),
            # 🔹 Web Push config (keeps PWA working)
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(
                    title=title,
                    body=body,
                    icon="https://kunjp44.github.io/lunar-observatory/frontend/assets/notification-icon.png",
                )
            ),
            # 🔹 Data payload (for foreground handling)
            data={"title": title, "body": body, "category": category},
        )

        try:
            messaging.send(message)

        except FirebaseError as e:
            print("Error sending to token:", token, e)

            if "Requested entity was not found" in str(e):
                delete_token(token)
                print("Deleted invalid token:", token)
