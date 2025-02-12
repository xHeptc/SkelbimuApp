import { db, ref, set, get, push, update, child, remove } from "./database.js"

const getPost = async (id) => {
    let post
    await get(child(ref(db), "posts/" + id))
        .then(snap => {
            post = snap.val()
        })

    return post
}

const createPost = (data) => {
    const postData = {
        author: data.author,
        title: data.title,
        description: data.description,
        image: data.image,
        price: data.price,
        category: data.category
    }

    const newPostKey = push(child(ref(db), "posts")).key

    const updates = {}
    updates["/posts/" + newPostKey] = postData
    updates["/users/" + postData.author + "/posts/" + newPostKey] = true

    return update(ref(db), updates)
}

const editPost = async (postId, data) => {
    const oldPost = await getPost(postId)

    const postData = {
        author: oldPost.author,
        title: data.title,
        description: data.description,
        image: data.image,
        price: data.price,
        category: data.category,
    }

    const updates = {}
    updates["/posts/" + postId] = postData
    updates["/users/" + postData.author + "/posts/" + postId] = true

    return update(ref(db), updates)
}

const deletePost = async (postId) => {
    const post = await getPost(postId)
    const author = post.author

    remove(ref(db, "users/" + author + "/posts/" + postId))
    return remove(ref(db, "posts/" + postId))
}

export { createPost, editPost, deletePost }