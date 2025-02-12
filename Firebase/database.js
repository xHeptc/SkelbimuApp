import app from "./firebaseConfig.js"
import { getDatabase, ref, set, get, push, update, child, remove, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js"

const db = getDatabase(app)

export { db, ref, set, get, push, update, child, remove, onValue }
