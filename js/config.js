import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export const firebaseConfig = {
    apiKey: "AIzaSyAcJ6nJ0sRcDb_cYG3RkMwBOZ_-1Hqz3XY",
    authDomain: "pro-bravo.firebaseapp.com",
    databaseURL: "https://pro-bravo-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "pro-bravo",
    storageBucket: "pro-bravo.firebasestorage.app",
    messagingSenderId: "540317526892",
    appId: "1:540317526892:web:83309074248663d9806149",
    measurementId: "G-NLBKFXPZDJ"
};

export const googleCalendarApiKey = "AIzaSyCQ9SBXkEILe6PZdmLyGBSFK63XhPM_V7o";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
