import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { initializeApp } from 'firebase/app';


const firebaseConfig = {
  apiKey: "AIzaSyDXEiZQktAonvaVtdJieOgjrjfoY5Bh86Y",
  authDomain: "sgu-manager.firebaseapp.com",
  databaseURL: "https://sgu-manager-default-rtdb.firebaseio.com",
  projectId: "sgu-manager",
  storageBucket: "sgu-manager.firebasestorage.app",
  messagingSenderId: "932163150484",
  appId: "1:932163150484:web:ba157a636701bd2479ca81",
  measurementId: "G-5GHEQMJHMS"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const app = initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

export { firebase, auth, database };