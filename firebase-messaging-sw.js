importScripts("https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyCcofnDYMVom82NSHwNsT_0oZzhsMiUEEA",
    authDomain: "lunar-observatory.firebaseapp.com",
    projectId: "lunar-observatory",
    storageBucket: "lunar-observatory.firebasestorage.app",
    messagingSenderId: "379098412161",
    appId: "1:379098412161:web:0e386d4c2744c058748980"
});

const messaging = firebase.messaging();