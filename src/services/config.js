// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: "AIzaSyBA5XMFh5f5jm-4ChzvpEFXR5GcEwJ2qH0",
  authDomain: "mcchst-867f8.firebaseapp.com",
  projectId: "mcchst-867f8",
  storageBucket: "mcchst-867f8.appspot.com",
  messagingSenderId: "569410507097",
  appId: "1:569410507097:web:85bbf37e3fb6b81c7c7c48",
  measurementId: "G-5MW5Q6JL53",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database(); // Get the database reference

export { firebase, database };
