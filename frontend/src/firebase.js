// Firebase config (from Firebase Console → Project Settings)
const firebaseConfig = {
    apiKey: "AIzaSyCcofnDYMVom82NSHwNsT_0oZzhsMiUEEA",
    authDomain: "lunar-observatory.firebaseapp.com",
    projectId: "lunar-observatory",
    storageBucket: "lunar-observatory.firebasestorage.app",
    messagingSenderId: "379098412161",
    appId: "1:379098412161:web:0e386d4c2744c058748980"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Ask permission + get token
export async function initPush() {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.log("Notification permission denied");
            return;
        }

        const token = await messaging.getToken({
            vapidKey: "BFZ0767uqrN5u5Ey0HmcKJYrUgbDchsWXChR1PSezmLQToHkgAD4eImqTtFdi2oA1MKBJB9lJ31Pr2SPmbBu8cU"
        });

        if (token) {
            console.log("FCM Token:", token);

            // Send token to backend
            await fetch("https://lunar-observatory.onrender.com/api/push/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(token)
            });
        }
    } catch (err) {
        console.error("Push init error:", err);
    }
}