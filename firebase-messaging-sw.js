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

// BACKGROUND MESSAGE HANDLER
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // This handler normally only runs when the app is in the background.
    // However, to be absolutely safe against double notifications, 
    // we let the browser handle the default display if we don't return a promise.
    //
    // IF YOU WANT TO CUSTOMIZE IT:
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/lunar-observatory/frontend/assets/notification-icon.png'
    };

    // return self.registration.showNotification(notificationTitle, notificationOptions);
});

// CLICK HANDLER (Focus or Open Window)
self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Notification click Received.');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // If a tab is already open, focus it
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url.includes('/lunar-observatory/') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new one
            if (clients.openWindow) {
                return clients.openWindow('/lunar-observatory/');
            }
        })
    );
});