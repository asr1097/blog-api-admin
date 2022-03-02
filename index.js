const main = document.getElementById("main");


const renderForm = (err = "") => {
    let loginForm = document.createElement("form");
    let usernameField = document.createElement("input");
    usernameField.type = "text";
    usernameField.name = "username";
    usernameField.id = "username";
    let passwordField = document.createElement("input");
    passwordField.type = "password";
    passwordField.name = "password";
    passwordField.id = "password";
    let submitField = document.createElement("input");
    submitField.type = "submit";
    let error = document.createElement("p");
    error.id = "error";
    error.textContent = err;
    loginForm.appendChild(usernameField);
    loginForm.appendChild(passwordField);
    loginForm.appendChild(submitField);
    loginForm.appendChild(error);
    main.appendChild(loginForm);

    loginForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        let data = {
            username: usernameField.value,
            password: passwordField.value
        };
        fetchLogin(data)
    })
}

const fetchLogin = (data) => {
    fetch("https://sheltered-anchorage-95159.herokuapp.com/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
        .then(res => {
            if(res.token) {
                localStorage.setItem("token", res.token);
                fetchData();
            } else{location.reload()}
        })
}

const fetchData = () => {
    fetch("https://sheltered-anchorage-95159.herokuapp.com/admin/", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
        .then(res => res.json())
        .then(data => renderPosts(data))
        .catch(err => {
            renderForm(err)
        })
}

const deleteComment = (ev) => {
    ev.preventDefault();
    fetch(`https://sheltered-anchorage-95159.herokuapp.com/admin/${ev.target.post.value}/${ev.target.comment.value}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }).then(response => location.reload()).catch(err => console.error(err))
}

const updatePost = (ev) => {
    ev.preventDefault();
    let data = {
        title: ev.target.title.value,
        text: ev.target.text.value,
        published: ev.target.published.value
    }
    fetch(`https://sheltered-anchorage-95159.herokuapp.com/admin/${ev.target.id.value}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(res => location.reload()).catch(err => console.error(err));
}

const renderPosts = (data) => {
    while(main.firstChild) {
        main.removeChild(main.firstChild)
    }

    let mainList = document.createElement("ul");
    data.forEach(post => {
        let list_item = document.createElement("li");
        let postForm = document.createElement("form");
        let title = document.createElement("input");
        let text = document.createElement("input");
        let published = document.createElement("input");
        let _id = document.createElement("input");
        let submit = document.createElement("input");
        title.type = "text";
        title.name = "title";
        text.type = "text";
        text.name = "text"
        published.type = "checkbox";
        published.name = "published";
        _id.type = "text";
        _id.value = post._id;
        _id.hidden = true;
        submit.type = "submit";
        submit.value = "Update post";
        let commentList = document.createElement("ul");
        title.value = post.title;
        text.value = post.text;
        published.checked = post.published ? true : false;
        postForm.appendChild(title);
        postForm.appendChild(text);
        postForm.appendChild(published);
        postForm.appendChild(_id);
        postForm.appendChild(submit);
        list_item.appendChild(postForm);
        postForm.addEventListener("submit", updatePost);
        post.comments.forEach((comment, index) => {
            let singleComment = document.createElement("li");
            let title = document.createElement("h5");
            let text = document.createElement("p");
            let user = document.createElement("p");
            let date = document.createElement("p");
            let deleteForm = document.createElement("form");
            deleteForm.action = `https://sheltered-anchorage-95159.herokuapp.com/admin/${post._id}/${index}`;
            deleteForm.method = "get";
            let postInput = document.createElement("input");
            let commentInput = document.createElement("input");
            let submitInput = document.createElement("input");
            postInput.type = "text";
            postInput.value = post._id;
            postInput.name = "post";
            postInput.hidden = true;
            commentInput.type = "text";
            commentInput.value = index;
            commentInput.hidden = true;
            commentInput.name = "comment";
            submitInput.type = "submit";
            deleteForm.appendChild(postInput);
            deleteForm.appendChild(commentInput);
            deleteForm.appendChild(submitInput);
            title.textContent = comment.title;
            text.textContent = comment.text;
            user.textContent = comment.user;
            date.textContent = comment.timestamp;
            singleComment.appendChild(title);
            singleComment.appendChild(text);
            singleComment.appendChild(user);
            singleComment.appendChild(date);
            singleComment.appendChild(deleteForm);
            commentList.appendChild(singleComment);

            deleteForm.addEventListener("submit", deleteComment);
        })
        list_item.appendChild(commentList);
        mainList.appendChild(list_item);
    })
    main.appendChild(mainList);
}

if(localStorage.getItem("token") === null) {
    renderForm();
} else {
    fetchData()
}