// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSyFccixHchCiYKu5WwWjpXt9p6gpfoZU",
  authDomain: "medisl-ed07f.firebaseapp.com",
  projectId: "medisl-ed07f",
  storageBucket: "medisl-ed07f.firebasestorage.app",
  messagingSenderId: "768721911850",
  appId: "1:768721911850:web:fb1db571308a44480b4353"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
