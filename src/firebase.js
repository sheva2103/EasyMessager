import { initializeApp } from "firebase/app";

// const firebaseConfig = {
//     apiKey: "AIzaSyCeCYHA-o-QnJRXyAU9e9LxvOZlbOE18sA",
//     authDomain: "easymessager-aa146.firebaseapp.com",
//     projectId: "easymessager-aa146",
//     storageBucket: "easymessager-aa146.appspot.com",
//     messagingSenderId: "895343022395",
//     appId: "1:895343022395:web:c82ffda6e3938a6d9b671e"
// };

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
};

const app = initializeApp(firebaseConfig);