import { createUser, login } from "./Firebase/auth.js"

const forms = document.querySelector(".forms")
const signInForm = forms.querySelector("#sign-in")
const signUpForm = forms.querySelector("#sign-up")

const registerButton = signUpForm.querySelector(".details button")
const loginButton = signInForm.querySelector(".details button")

// Switch form handling \\
const toSignIn = signUpForm.querySelector("span a")
const toSignUp = signInForm.querySelector("span a")

const showMessage = (state, message, where) => {
    const messageContainer = forms.querySelector(`#sign-${where} .message`)
    messageContainer.innerHTML = message
    messageContainer.classList.add(state)

    setTimeout(() => {
        messageContainer.classList.remove(state)
    }, 5000);
}

toSignIn.addEventListener("click", (e) => {
    e.preventDefault()

    signInForm.classList.remove("hidden")
    signUpForm.classList.add("hidden")
})

toSignUp.addEventListener("click", (e) => {
    e.preventDefault()

    signInForm.classList.add("hidden")
    signUpForm.classList.remove("hidden")
})

// Sign-up \\
registerButton.addEventListener("click", (e) => {
    e.preventDefault()

    const nameInput = signUpForm.querySelector(".details .detail .name-inp")
    const lastNameInput = signUpForm.querySelector(".details .detail .lastName-inp")
    const emailInput = signUpForm.querySelector(".details .detail .email-inp")
    const passInput = signUpForm.querySelector(".details .detail .pass-inp")

    nameInput.classList.add("interacted")
    lastNameInput.classList.add("interacted")
    emailInput.classList.add("interacted")
    passInput.classList.add("interacted")

    // Validation \\
    if (nameInput.value.length <= 2) {
        showMessage("error", "Per trumpas vardas!", "up")
        return
    }

    if (lastNameInput.value.length <= 2) {
        showMessage("error", "Per trumpa pavardė!", "up")
        return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        showMessage("error", "Netinkamas el.paštas!", "up")
        return
    }

    if (passInput.value.length <= 6) {
        showMessage("error", "Per silpnas slaptažodis!", "up")
        return
    }

    createUser(nameInput.value, lastNameInput.value, emailInput.value, passInput.value, (success, result) => {
        if (!success) {
            console.log(result)
            
            if (result.code === "auth/email-already-in-use") {
                showMessage("error", "El.paštas užimtas!", "up")
            } else {
                showMessage("error", "Klaida!", "up")
            }

            return
        }   
        
        toSignIn.click()
        showMessage("success", "Paskyra sėkmingai sukurta!", "in")
    })
})

loginButton.addEventListener("click", (e) => {
    e.preventDefault()

    const emailInput = signInForm.querySelector(".details .detail .email-inp")
    const passInput = signInForm.querySelector(".details .detail .pass-inp")

    login(emailInput.value, passInput.value, (success, result) => {
        console.log(result.code)
        if (result.code === "auth/invalid-email" || result.code == "auth/invalid-credential") {
            showMessage("error", "Neteisingi duomenys!", "in")
        }
    })
})

