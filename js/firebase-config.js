// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHMdRKe5EUoiw9f7rTXZUpyW2Y02zPL4M",
  authDomain: "setlify-bff8f.firebaseapp.com",
  projectId: "setlify-bff8f",
  storageBucket: "setlify-bff8f.firebasestorage.app",
  messagingSenderId: "185457141481",
  appId: "1:185457141481:web:e483220a7d3e22f1653278",
  measurementId: "G-PF7L5R4L35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar para usar en otros archivos
export { app, auth, db, analytics };