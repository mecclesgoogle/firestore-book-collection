// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyB39EJm-MhX33KpSKx_aLF0T2rXlx_fll0",
	authDomain: "marks-firestore-app.firebaseapp.com",
	projectId: "marks-firestore-app",
	storageBucket: "marks-firestore-app.appspot.com",
	messagingSenderId: "719247382864",
	appId: "1:719247382864:web:c28784bc4c3fae18fd3455",
	measurementId: "G-Z7YK7RFBX2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics: Enable later if needed.
// const analytics = getAnalytics(firestoreApp);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export default db;