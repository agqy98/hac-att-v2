import { initializeApp } from 'firebase/app';

import { getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

  const firebaseConfig = {
    apiKey: "AIzaSyBa9RUyfAJEzPMRq0EoL2eYpRg9hhuoC0w",
    authDomain: "hac-att-2.firebaseapp.com",
    databaseURL: "https://hac-att-2-default-rtdb.firebaseio.com",
    projectId: "hac-att-2",
    storageBucket: "hac-att-2.appspot.com",
    messagingSenderId: "1062607500832",
    appId: "1:1062607500832:web:a3892b6172bfdb3f326e45",
    measurementId: "G-1YXYPR96QJ"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore(app);  //  getDatabase()

export const createUser = createUserWithEmailAndPassword
export const signinUser = signInWithEmailAndPassword
export const signoutUser = signOut
export default app