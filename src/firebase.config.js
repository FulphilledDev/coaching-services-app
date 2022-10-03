import { initializeApp } from "firebase/app";
// Import firestore as db to use
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoX5hqEk0aH47GA7EwcdTECs9G_Kzebkc",
  authDomain: "better-coaching-app.firebaseapp.com",
  projectId: "better-coaching-app",
  storageBucket: "better-coaching-app.appspot.com",
  messagingSenderId: "837389835767",
  appId: "1:837389835767:web:b43206a771fd1ed7f0e2f2"
};

// Initialize Firebase
initializeApp(firebaseConfig);

export const db = getFirestore()