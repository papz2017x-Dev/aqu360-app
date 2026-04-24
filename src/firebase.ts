import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBj651Qmyz6Xtou6CPG9uKc0qn0YjimcSY",
  authDomain: "aqua360-c6f6e.firebaseapp.com",
  projectId: "aqua360-c6f6e",
  storageBucket: "aqua360-c6f6e.firebasestorage.app",
  messagingSenderId: "164523790814",
  appId: "1:164523790814:web:016db34c1c7e8426a44d4f",
  measurementId: "G-1C0HXT9RS4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
