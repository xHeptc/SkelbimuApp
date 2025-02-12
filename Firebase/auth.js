import { db, ref, set } from "./database.js"
import { getAuth,
         onAuthStateChanged,
         createUserWithEmailAndPassword,
         signInWithEmailAndPassword,
         signOut
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js"

const auth = getAuth()

const logOut = () => {
    signOut(auth).then().catch(err => { console.log(err) })
}

const createUser = (name, lastName, email, password, callback) => {
    createUserWithEmailAndPassword(auth, email, password)
        .then(creds => {
            const user = creds.user
            const uid = user.uid

            const data = {
                name, 
                lastName,
                email,
                role: "user"
            }

            set(ref(db, "users/" + uid), data)

            console.log("Account created!")

            if (callback) {
                callback(true, user)
            }
        })
        .catch(err => {
            if (callback) {
                callback(false, err)
            }
        })
}

const login = (email, password, callback) => {
    signInWithEmailAndPassword(auth, email, password)
        .then().catch(err => {
            if (callback) {
                callback(false, err)
            }
        })
}

export { getAuth, createUser, login, onAuthStateChanged, logOut }