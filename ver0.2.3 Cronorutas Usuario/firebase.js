import * as firebase from "firebase";
import "firebase/database";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlZR4s8-03gQVLD21ZmHdUrCgj56JJLa8",
  authDomain: "cronorutas-cec37.firebaseapp.com",
  databaseURL: "https://cronorutas-cec37-default-rtdb.firebaseio.com",
  projectId: "cronorutas-cec37",
  storageBucket: "cronorutas-cec37.firebasestorage.app",
  messagingSenderId: "783697441480",
  appId: "1:783697441480:web:30617578e68bafe3186bfd",
  measurementId: "G-N4JBHM98QL"
};

// 🔥 IMPORTANTE: este check cambia
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
const auth = firebase.auth();

export { db, auth };