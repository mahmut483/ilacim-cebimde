import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeVmmFfSFGx3qJycI5e0jGGN7CTh7twnM",
  authDomain: "ilac-cebimde.firebaseapp.com",
  projectId: "ilac-cebimde",
  storageBucket: "ilac-cebimde.firebasestorage.app",
  messagingSenderId: "965606173654",
  appId: "1:965606173654:web:862335794a7004fd70d277",
  measurementId: "G-711TLQQG9G"
};

// Initialize Firebase
// Check if firebase app is already initialized to avoid duplicate app error in hot-reload
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics (only on client side supported browsers)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
