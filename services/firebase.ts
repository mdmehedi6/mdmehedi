
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAbbvG68VVpySnlKLQvnxPOuLnVEjMFm90",
    authDomain: "trickmibot-22bf2.firebaseapp.com",
    projectId: "trickmibot-22bf2",
    storageBucket: "trickmibot-22bf2.firebasestorage.app",
    messagingSenderId: "362731654661",
    appId: "1:362731654661:web:44690327d585c46c19566c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
