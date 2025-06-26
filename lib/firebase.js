// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5T7JHjnbEdugslFijF1few6nQsZUS9Y4",
  authDomain: "shaliniarchana-b81ff.firebaseapp.com",
  databaseURL: "https://shaliniarchana-b81ff-default-rtdb.firebaseio.com",
  projectId: "shaliniarchana-b81ff",
  storageBucket: "shaliniarchana-b81ff.firebasestorage.app",
  messagingSenderId: "801347532318",
  appId: "1:801347532318:web:8ddfc1cdd55ebd72eae00f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
