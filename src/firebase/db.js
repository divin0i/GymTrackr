import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZn5G0KBurkaGAHffzPiRJnKBfB8u2tSE",
  authDomain: "gymntrackr.firebaseapp.com",
  projectId: "gymntrackr",
  storageBucket: "gymntrackr.firebasestorage.app",
  messagingSenderId: "687688918607",
  appId: "1:687688918607:web:a093cfc25d02d27a44ec3a",
  measurementId: "G-DXVYFCPK3M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };