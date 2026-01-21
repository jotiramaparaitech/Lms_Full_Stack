// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAZT7m_Ec5ypxSv0naqkXPCWYbtYj3TmE",
  authDomain: "aparaitech-lms.firebaseapp.com",
  projectId: "aparaitech-lms",
  storageBucket: "aparaitech-lms.firebasestorage.app",
  messagingSenderId: "146077369358",
  appId: "1:146077369358:web:634ca2f42816dee516285f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { 
      // ✅ READ FROM ENV VARIABLE
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    
    if (currentToken) {
      console.log('client token received: ', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

// ✅ FIXED: Removed "new Promise" so it listens continuously
export const onMessageListener = (callback) => {
  if (!messaging) return;
  
  // This listens for messages endlessly
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};