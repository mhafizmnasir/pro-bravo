importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Guna config yang sama macam dalam index.html anda
const firebaseConfig = {
        apiKey: "AIzaSyAcJ6nJ0sRcDb_cYG3RkMwBOZ_-1Hqz3XY",
        authDomain: "pro-bravo.firebaseapp.com",
        databaseURL: "https://pro-bravo-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "pro-bravo",
        storageBucket: "pro-bravo.firebasestorage.app",
        messagingSenderId: "540317526892",
        appId: "1:540317526892:web:83309074248663d9806149",
        measurementId: "G-NLBKFXPZDJ"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Logik untuk paparkan notifikasi bila diterima di latar belakang
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon-32x32.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
