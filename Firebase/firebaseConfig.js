import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOqn_YFHmr9suhOsKbho5ywRwC-AvPXyw",
  authDomain: "skelbimai-1e4cb.firebaseapp.com",
  databaseURL: "https://skelbimai-1e4cb-default-rtdb.firebaseio.com",
  projectId: "skelbimai-1e4cb",
  storageBucket: "skelbimai-1e4cb.firebasestorage.app",
  messagingSenderId: "332882554374",
  appId: "1:332882554374:web:2edd103ffdb0a3d0ab9d87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export default app