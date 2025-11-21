import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB-qCFcC0LK_Om7afo-MxH8o2UO0GgzJPY",
    authDomain: "gameportal-bd7a6.firebaseapp.com",
    projectId: "gameportal-bd7a6",
    storageBucket: "gameportal-bd7a6.firebasestorage.app",
    messagingSenderId: "569866628750",
    appId: "1:569866628750:web:c4c4043a6eee16e8e263df",
    measurementId: "G-N0ZLB30H7F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export const db = getFirestore(app);
