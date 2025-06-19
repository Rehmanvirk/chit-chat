import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Removed: import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chitchat-88e51.firebaseapp.com",
  projectId: "chitchat-88e51",
  storageBucket: "chitchat-88e51.firebasestorage.app", 
  messagingSenderId: "684350726602",
  appId: "1:684350726602:web:27c1b27c2c840592096f33",
  measurementId: "G-J2V1WXBEWH"
};

export const app = initializeApp(firebaseConfig);

// export const auth = getAuth();
// export const db = getFirestore();

export const auth = getAuth(app);
export const db = getFirestore(app);
