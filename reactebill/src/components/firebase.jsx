// firebase.jsx
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // For Firestore

const firebaseConfig = {
apiKey: "AIzaSyAZiilwunruzcdRYxFqRy9g-juHwd6saDg",
authDomain: "fir-36e33.firebaseapp.com",
projectId: "fir-36e33",
storageBucket: "fir-36e33.appspot.com",
messagingSenderId: "798982306398",
appId: "1:798982306398:web:5d00a6ad3e7a8463c592cf",
measurementId: "G-RHW1WRZ66W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app); // This line initializes Firestore

export { auth, db }; // Ensure you export both auth and db for use in other files
