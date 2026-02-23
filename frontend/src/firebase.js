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
async function setupPush() {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Register correct SW
        const registration = await navigator.serviceWorker.register(
            "./firebase-messaging-sw.js"
        );

        // IMPORTANT: pass registration here
        const token = await getToken(messaging, {
            vapidKey: "BFZ0767uqrN5u5Ey0HmcKJYrUgbDchsWXChR1PSezmLQToHkgAD4eImqTtFdi2oA1MKBJB9lJ31Pr2SPmbBu8cU",
            serviceWorkerRegistration: registration
        });

        console.log("Device FCM Token:", token);

    } catch (err) {
        console.error("Push setup error:", err);
    }
}