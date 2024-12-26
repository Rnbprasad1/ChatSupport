import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC8Yk_GH540Gee0h3ZZJwFExQ9zkMS1mfs",
  authDomain: "cheltojava.firebaseapp.com",
  projectId: "cheltojava",
  storageBucket: "cheltojava.firebasestorage.app",
  messagingSenderId: "496876614050",
  appId: "1:496876614050:web:83cffb29186112f42502fb",
  measurementId: "G-BS70PSY1LE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);