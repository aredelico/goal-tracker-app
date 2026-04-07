import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Paste your Firebase project config here.
// Firebase Console → Project Settings → Your apps → Web app → firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyDPxDiz0mgxBoqNy-yaWB3ESKBjv0yRJXQ",
  authDomain: "goal-tracker-app-c1e5f.firebaseapp.com",
  projectId: "goal-tracker-app-c1e5f",
  storageBucket: "goal-tracker-app-c1e5f.firebasestorage.app",
  messagingSenderId: "433185357672",
  appId: "1:433185357672:web:ddd3928e8bb906425420dd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const firestore = getFirestore(app);
