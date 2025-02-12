import { registerUser, login } from "./Firebase/authentication.js";

// Sign in | Sign up Handler \\
const signInForm = document.querySelector(".forms #sign-in")
const signInButton = signInForm.querySelector(".details button[type='submit']")
const switchToSignUp = signInForm.querySelector("span a")

const signUpForm = document.querySelector(".forms #sign-up")
const signUpButton = signUpForm.querySelector(".details button[type='submit']")
const switchToSignIn = signUpForm.querySelector("span a")

const showMessage = (status, message, parent) => {
    const messageDiv = document.querySelector(`.forms #sign-${parent} .message`)

    messageDiv.classList.add(status)
    messageDiv.classList.remove("hidden")
    messageDiv.innerHTML = message

    setTimeout(() => {
        messageDiv.classList.add("hidden")
        messageDiv.classList.remove(status)
    }, 5000)
}

// Switching \\
switchToSignIn.addEventListener("click", (e) => {
    signUpForm.classList.add("hidden")
    signInForm.classList.remove("hidden")
})

switchToSignUp.addEventListener("click", (e) => {
    signInForm.classList.add("hidden")
    signUpForm.classList.remove("hidden")
})

// Registration \\
signUpButton.addEventListener("click", (e) => {
    e.preventDefault()

    const nameInput = signUpForm.querySelector(".details .detail .name-inp")
    const lastNameInput = signUpForm.querySelector(".details .detail .lastName-inp")
    const emailInput = signUpForm.querySelector(".details .detail .email-inp")
    const passInput = signUpForm.querySelector(".details .detail .pass-inp")

    nameInput.classList.add("submitted")
    lastNameInput.classList.add("submitted")
    emailInput.classList.add("submitted")
    passInput.classList.add("submitted")

    if (nameInput.value.length <= 2 || lastNameInput.value.length <= 2) {
        showMessage("error", "Netinkamas vardas arba pavardė!", "up")
        return
    }

    registerUser(nameInput.value, lastNameInput.value, emailInput.value, passInput.value, (status, res) => {
        console.log(res)
        if (status == "error") {
            if (res == "auth/missing-password") {
                showMessage("error", "Netinkamas slaptažodis!", "up")
            }
            else if (res == "auth/weak-password") {
                showMessage("error", "Silpnas slaptažodis!", "up")
            } 
            else if (res == "auth/invalid-email") {
                showMessage("error", "Netinkamas el.paštas!", "up")
            } 
            else if (res == "auth/email-already-in-use") {
                showMessage("error", "Paskyra su šiuo el.paštu jau egzistuoja!", "up")
            } 

            return
        }

        showMessage("success", "Registracija sėkminga!", "in")
    })
})

signInButton.addEventListener("click", (e) => {
    e.preventDefault()

    const email = signInForm.querySelector(".details .detail .email-inp").value
    const pass = signInForm.querySelector(".details .detail .pass-inp").value

    login(email, pass, (status, res) => {
        if (status === "error") {
            if (res === "auth/invalid-credential" || res === "auth/missing-password" || res === "auth/invalid-email") {
                showMessage("error", "Neteisingi prisijungimo duomenys!", "in")
            }

            return
        }
        
        showMessage("success", "Sėkmingai prisijungėte!", "in")
    })
})