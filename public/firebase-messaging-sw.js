importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBj651Qmyz6Xtou6CPG9uKc0qn0YjimcSY",
  authDomain: "aqua360-c6f6e.firebaseapp.com",
  projectId: "aqua360-c6f6e",
  storageBucket: "aqua360-c6f6e.firebasestorage.app",
  messagingSenderId: "164523790814",
  appId: "1:164523790814:web:016db34c1c7e8426a44d4f",
  measurementId: "G-1C0HXT9RS4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/a360.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
