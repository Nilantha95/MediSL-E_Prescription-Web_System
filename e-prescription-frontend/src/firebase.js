// firebase.js import
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Firebase config key
  apiKey: "AIzaSyCSyFccixHchCiYKu5WwWjpXt9p6gpfoZU",
  authDomain: "medisl-ed07f.firebaseapp.com",
  projectId: "medisl-ed07f",
  storageBucket: "medisl-ed07f.firebasestorage.app",
  messagingSenderId: "768721911850",
  appId: "1:768721911850:web:fb1db571308a44480b4353"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); 

export { db, auth, storage}; 