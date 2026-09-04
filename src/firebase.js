import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCetdmchWNaLTpCKV8z_2myll1oSoSWGNA",
  authDomain: "tution-50fb4.firebaseapp.com",
  projectId: "tution-50fb4",
  storageBucket: "tution-50fb4.firebasestorage.app",
  messagingSenderId: "821200022704",
  appId: "1:821200022704:web:6f41d0753c421dcf5a1f75",
  measurementId: "G-RJ0FDH2JJB"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { 
      // VAPID key is optional if setup correctly, but good to have. We'll leave it empty for default handling.
    });
    if (currentToken) {
      console.log('FCM Token:', currentToken);
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

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default app;
