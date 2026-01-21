// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyDAZT7m_Ec5ypxSv0naqkXPCWYbtYj3TmE",
  authDomain: "aparaitech-lms.firebaseapp.com",
  projectId: "aparaitech-lms",
  storageBucket: "aparaitech-lms.firebasestorage.app",
  messagingSenderId: "146077369358",
  appId: "1:146077369358:web:634ca2f42816dee516285f"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

  // 1. SAFE EXTRACTION: Check 'data' first, then 'notification'
  const title = payload.data?.title || payload.notification?.title || "Ticket Update";
  const body = payload.data?.body || payload.notification?.body || "You have a new update";
  const icon = payload.data?.icon || '/ALogo.png';

  const notificationOptions = {
    body: body,
    icon: icon,
    data: payload.data // Pass URL for clicking
  };

  return self.registration.showNotification(title, notificationOptions);
});