import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCvJnY7uqorqJbSi_0YVcbi0QwK7VPUKqw",
  authDomain: "todolocationapp-cb5e5.firebaseapp.com",
  projectId: "todolocationapp-cb5e5",
  storageBucket: "todolocationapp-cb5e5.firebasestorage.app",
  messagingSenderId: "1637879775",
  appId: "1:1637879775:web:ce974b3d2c958b48837e6a"
};

const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
