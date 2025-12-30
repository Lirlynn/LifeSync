
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHIy2I6uqi6T0yOgsk4y-FiY5q45_IZdk",
  authDomain: "lifesync-f333b.firebaseapp.com",
  databaseURL: "https://lifesync-f333b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lifesync-f333b",
  storageBucket: "lifesync-f333b.firebasestorage.app",
  messagingSenderId: "989005002280",
  appId: "1:989005002280:web:3e097dd6e9d03740b8a71d",
  measurementId: "G-12DXEHF8Q2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
