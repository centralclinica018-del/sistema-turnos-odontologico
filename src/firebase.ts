// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXlPrZiATHuszcdL3hrQwyRvd4SIHBnXA",
  authDomain: "inventario-pro-86a3b.firebaseapp.com",
  projectId: "inventario-pro-86a3b",
  storageBucket: "inventario-pro-86a3b.firebasestorage.app",
  messagingSenderId: "1007545365827",
  appId: "1:1007545365827:web:646b555a68cfa331d1abf6"
};

// Initialize Firebase
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);