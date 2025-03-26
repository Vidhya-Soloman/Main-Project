import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging"; // Keep this import

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAZiilwunruzcdRYxFqRy9g-juHwd6saDg",
  authDomain: "fir-36e33.firebaseapp.com",
  projectId: "fir-36e33",
  storageBucket: "fir-36e33.firebasestorage.app",
  messagingSenderId: "798982306398",
  appId: "1:798982306398:web:5d00a6ad3e7a8463c592cf",
  measurementId: "G-RHW1WRZ66W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app); // Initialize messaging

// Request permission for push notifications (Web)
export const requestPermissionAndGetToken = async () => {
  try {
    const status = await Notification.requestPermission();
    if (status === "granted") {
      const token = await getToken(messaging, { vapidKey: "BFWk7jrHlT8bZoXY0gXDRbRNMC0_IZrN01VJW2lu4Ry-S0HiFfd5G-8PMBOzaAX0vAl5xmbtuhzMnSeu9Nr_r7Q" }); 
      console.log("FCM Token: ", token);
      return token;
    } else {
      console.error("Notification permission denied.");
    }
  } catch (error) {
    console.error("Error requesting permission and getting token: ", error);
  }
};

// On receiving a message when app is in foreground
onMessage(messaging, (payload) => {
  console.log("Message received: ", payload);
  new Notification(payload.notification.title, {
    body: payload.notification.body,
  });
});

export { auth, db, messaging };
