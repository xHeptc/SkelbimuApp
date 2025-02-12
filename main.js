import { db, ref, set, get, child, push, update, remove, onValue } from "./Firebase/database.js"
import { createPost, editPost, deletePost } from "./Firebase/postHandler.js"
import { getAuth, logOut, onAuthStateChanged } from "./Firebase/auth.js"

const forms = document.querySelector(".forms")
const main = document.querySelector(".main-container")
const navigationButtons = main.querySelectorAll("aside ul li")
const settingsNavigationButtons = main.querySelectorAll(".settings .navigation li")
const adminNav = main.querySelector("aside ul li#config")

const openPostDialog = main.querySelector("#create-post-btn")
const postCreateDialog = main.querySelector(".create-post-dialog")
const dialogTitle = postCreateDialog.querySelector(".title")

const closeDialog = postCreateDialog.querySelector("form .top .close")
const submitPost = postCreateDialog.querySelector("button[type='submit']")

const postTitleInp = postCreateDialog.querySelector("form .details .post-title-inp")
const postCategoryInp = postCreateDialog.querySelector("form .details .post-category-inp")
const postDescriptionInp = postCreateDialog.querySelector("form .details .post-description-inp")
const postImageInp = postCreateDialog.querySelector("form .details .post-image-inp")
const postPriceInp = postCreateDialog.querySelector("form .details .post-price-inp")

const auth = getAuth()

const getUser = async () => { 
    let user
    await get(child(ref(db), "users/" + auth.currentUser.uid))
            .then(snap => {
                if (!snap.exists()) {
                    return
                }

                user = snap.val()
            })

    return user
}

const getCategories = async () => {
    let categories
    await get(child(ref(db), "categories"))
            .then(snap => {
                if (!snap.exists()) {
                    return
                }

                categories = snap.val()
            })

    return categories
}

// Init categories \\
const categories = await getCategories()

for (const category in categories) {
    const option = document.createElement("option")
    option.innerHTML = category
    option.value = category

    postCategoryInp.appendChild(option)
}

const loadPosts = async posts => {
    const user = await getUser()
    console.log(user)

    const myPostsContainer = main.querySelector(".page#my-posts .post-grid")
    const allPostsContainer = main.querySelector(".page#all-posts .post-grid")
    const likedPostsContainer = main.querySelector(".page#liked-posts .post-grid")
    const postTemplate = document.querySelector("#post-template").content

    myPostsContainer.replaceChildren()
    allPostsContainer.replaceChildren()
    likedPostsContainer.replaceChildren()  

    const createPostElement = (info) => {
        const post = postTemplate.cloneNode(true)
        const titleElement = post.querySelector(".post-title")
        const descriptionElement = post.querySelector(".post-description")
        const categoryElement = post.querySelector(".post-category")
        const imageElement = post.querySelector(".post-image")
        const priceElement = post.querySelector(".post-price")
        const authorElement = post.querySelector(".post-author")
        const savePost = post.querySelector(".save-post")
        const editPost = post.querySelector(".edit")
        const removePost = post.querySelector(".remove")

        console.log(info)
        categoryElement.innerHTML = info.category
        titleElement.innerHTML = info.title
        descriptionElement.innerHTML = info.description
        imageElement.src = info.image
        priceElement.innerHTML = `Kaina - ${info.price === "0" ? "NEMOKAMA" : info.price + "€"}`
        authorElement.innerHTML = `${info.author.name} ${info.author.lastName}`

        if (info.authorId === auth.currentUser.uid) {
            savePost.classList.add("hidden")
            editPost.classList.remove("hidden")
            removePost.classList.remove("hidden")
        }

        if (user.blocked) {
            editPost.classList.add("disabled")
        }

        if (user.role === "admin") {
            editPost.classList.remove("hidden")
            removePost.classList.remove("hidden")
        }

        if (user["saved-posts"] && user["saved-posts"][info.post_id]) {
            const parent = savePost.closest(".post-item")
            parent.classList.add("saved")
        }

        editPost.addEventListener("click", async () => {
            if (user.blocked) {
                return
            }
            
            postCategoryInp.value = info.category
            postTitleInp.value = info.title
            postDescriptionInp.value = info.description
            postImageInp.value = info.image
            postPriceInp.value = info.price

            submitPost.innerHTML = "Redaguoti"
            dialogTitle.innerHTML = "Redaguoti Skelbimą"
            postCreateDialog.setAttribute("editing", info.post_id)
            postCreateDialog.showModal()
        })

        removePost.addEventListener("click", () => {
            deletePost(info.post_id).then(() => {
                window.location.href = "main.html"
            })
        })

        savePost.addEventListener("click", async () => {
            const parent = savePost.closest(".post-item")
            parent.classList.toggle("saved")

            const isSaved = parent.classList.contains("saved")
            if (isSaved) {
                update(ref(db), {
                    ["users/" + auth.currentUser.uid + "/saved-posts/" + info.post_id]: true
                })
            } else {
                await remove(ref(db, "users/" + auth.currentUser.uid + "/saved-posts/" + info.post_id))
            }
        })

        return post
    }

    for (const id in posts) {
        const info = posts[id]
        let author

        await get(child(ref(db), "users/" + info.author))
            .then(snap => {
                if (!snap.exists()) {
                    return
                }

                author = snap.val()
            })


        const postData = {
            post_id: id,
            title: info.title,
            description: info.description,
            image: info.image,
            price: info.price,
            authorId: info.author,
            category: info.category,
            author
        }

        const post = createPostElement(postData)
        allPostsContainer.appendChild(post)

        if (info.author == auth.currentUser.uid) {
            const post = createPostElement(postData)
            myPostsContainer.appendChild(post)
        }

        if (user["saved-posts"] && user["saved-posts"][id]) {
            const post = createPostElement(postData)
            likedPostsContainer.appendChild(post)
        }
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        forms.classList.remove("hidden")
        main.classList.add("hidden")

        return
    }

    await get(child(ref(db), "users/" + user.uid))
        .then(snapshot => {
            if (!snapshot.exists()) {
                return
            }

            user = snapshot.val()
        })

    const welcomeSpan = main.querySelector(".welcome")
    welcomeSpan.innerHTML = `Sveiki, <span>${user.name}</span>`

    if (user.role === "admin") {
        welcomeSpan.classList.add("admin")
        adminNav.classList.remove("hidden")
    }

    if (user.blocked) {
        openPostDialog.classList.add("disabled")
    }

    await get(child(ref(db), "posts"))
        .then(snapshot => {
            if (!snapshot.exists()) {
                return
            }

            const posts = snapshot.val()
            loadPosts(posts)
        })

    forms.classList.add("hidden")
    main.classList.remove("hidden")
})

const signoutBtn = main.querySelector(".sign-out")

signoutBtn.addEventListener("click", () => {
    logOut()
})

// Navigation \\
navigationButtons.forEach(element => {
    element.addEventListener("click", e => {
        e.preventDefault()

        const currentActive = main.querySelector("aside ul li.active")
        currentActive.classList.remove("active")

        element.classList.add("active")

        const toOpen = element.querySelector("a").getAttribute("id")
        const allPages = document.querySelectorAll("main > article.page")

        allPages.forEach(element => {
            element.classList.add("hidden")
        })

        console.log(toOpen)

        const toShow = main.querySelector(`article#${toOpen}`)
        toShow.classList.remove("hidden")
    })
})

settingsNavigationButtons.forEach(element => {
    element.addEventListener("click", e => {
        e.preventDefault()

        const currentActive = main.querySelector(".settings .navigation li.active")
        currentActive.classList.remove("active")

        element.classList.add("active")

        const toOpen = element.querySelector("a").getAttribute("id")
        const allPages = main.querySelectorAll(".settings article.page")

        allPages.forEach(page => {
            page.classList.add("hidden")
        })

        const toShow = main.querySelector(`.settings article#${toOpen}`)
        toShow.classList.remove("hidden")
    })
})

// Create a Post \\
closeDialog.addEventListener("click", (e) => {
    e.preventDefault()
    postCreateDialog.close()
})

openPostDialog.addEventListener("click", async (e) => {
    e.preventDefault()
    const user = await getUser()

    if (user.blocked) {
        return
    }

    postCreateDialog.querySelector("form").reset()
    submitPost.innerHTML = "Skelbti"
    dialogTitle.innerHTML = "Naujas Skelbimas"
    postCreateDialog.removeAttribute("editing")
    postCreateDialog.showModal()
})

submitPost.addEventListener("click", (e) => {
    e.preventDefault()

    postTitleInp.classList.add("interacted")
    postDescriptionInp.classList.add("interacted")
    postImageInp.classList.add("interacted")
    postPriceInp.classList.add("interacted")

    if (postTitleInp.value.length < 3) {
        return
    }

    if (postDescriptionInp.value.length < 5) {
        return
    }

    if (postImageInp.value.length < 3) {
        return
    }

    const postData = {
        author: auth.currentUser.uid,
        title: postTitleInp.value,
        description: postDescriptionInp.value,
        image: postImageInp.value,
        price: postPriceInp.value,
        category: postCategoryInp.value
    }

    const isEditing = postCreateDialog.getAttribute("editing")

    if (isEditing) {
        editPost(isEditing, postData).then(() => {
            postCreateDialog.close()
            window.location.href = "main.html"
        })
        .catch(err => {
            console.log(err)
        })

        return
    }

    createPost(postData).then(() => {
        postCreateDialog.close()
        window.location.href = "main.html"
    })
    .catch(err => {
        console.log(err)
    })
})

// Admin stuff \\
const userTemplate = document.querySelector("#user-template").content
const usersContainer = main.querySelector("article#users")

let allUsers

await get(ref(db, "users")).then(snap => {
    allUsers = snap.val()
})

console.log(allUsers)

for (const [id, user] of Object.entries(allUsers)) {
    let clone = userTemplate.cloneNode(true)
    const userElement = clone.querySelector(".user-name")
    const userTypeImg = clone.querySelector(".user-type")
    const userBlockedImig = clone.querySelector(".user-blocked")

    const blockUser = clone.querySelector(".block")
    const blockImg = blockUser.querySelector("img")

    clone = userBlockedImig.closest("div.user")

    if (user.blocked) {
        userBlockedImig.src = "./Assets/blocked-user.svg"
        blockImg.src = "./Assets/unblock.svg"
        clone.classList.add("blocked")
    }

    if (user.role === "admin") {
        userTypeImg.src = "./Assets/admin.svg"
        clone.classList.add("admin")
    }

    userElement.innerHTML = `${user.name} ${user.lastName}`

    blockUser.addEventListener("click", () => {
        const blocked = clone.classList.toggle("blocked")

        update(ref(db, "users/" + id), {
            blocked: (blocked === true) ? blocked : null
        })
        
        if (blocked) {
            userBlockedImig.src = "./Assets/blocked-user.svg"
            blockImg.src = "./Assets/unblock.svg"
            return
        }

        userBlockedImig.src = "./Assets/unblocked-user.svg"
        blockImg.src = "./Assets/block.svg"
    })

    usersContainer.appendChild(clone)
}