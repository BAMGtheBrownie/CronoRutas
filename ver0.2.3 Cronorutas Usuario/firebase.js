import * as firebase from "firebase";
import "firebase/database";
import "firebase/auth";



// este check cambia
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
const auth = firebase.auth();

export { db, auth };
