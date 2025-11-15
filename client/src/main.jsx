import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 🔥 Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7zYsgXaKtT3QaC2iBh_RzQPB2K0ghQ4w",
  authDomain: "codemate-cfb1c.firebaseapp.com",
  projectId: "codemate-cfb1c",
  storageBucket: "codemate-cfb1c.firebasestorage.app",
  messagingSenderId: "263856384506",
  appId: "1:263856384506:web:a6679867a37b89cbe61c43"
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Expose auth to App
export { auth };

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
