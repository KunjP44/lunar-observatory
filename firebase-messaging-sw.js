importScripts("https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyCcofnDYMVom82NSHwNsT_0oZzhsMiUEEA",
    authDomain: "lunar-observatory.firebaseapp.com",
    projectId: "lunar-observatory",
    storageBucket: "lunar-observatory.firebasestorage.app",
    messagingSenderId: "379098412161",
    appId: "1:379098412161:web:0e386d4c2744c058748980"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Optional: Handle background messages specifically if needed
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/lunar-observatory/frontend/assets/notification-icon.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});