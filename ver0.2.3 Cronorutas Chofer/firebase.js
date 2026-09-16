import * as firebase from "firebase";
import "firebase/auth";
import "firebase/database";

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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.database();

export default firebase;