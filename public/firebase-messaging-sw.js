importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCetdmchWNaLTpCKV8z_2myll1oSoSWGNA",
  authDomain: "tution-50fb4.firebaseapp.com",
  projectId: "tution-50fb4",
  storageBucket: "tution-50fb4.firebasestorage.app",
  messagingSenderId: "821200022704",
  appId: "1:821200022704:web:6f41d0753c421dcf5a1f75",
  measurementId: "G-RJ0FDH2JJB"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
