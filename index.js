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

const renderPosts = (data) => {
    while(main.firstChild) {
        main.removeChild(main.firstChild)
    }

    let mainList = document.createElement("ul");
    data.forEach(post => {
        let list_item = document.createElement("li");
        let title = document.createElement("h3");
        let text = document.createElement("p");
        let date = document.createElement("p");
        let commentList = document.createElement("ul");
        title.textContent = post.title;
        text.textContent = post.text;
        date.textContent = post.timestamp;
        list_item.appendChild(title);
        list_item.appendChild(text);
        list_item.appendChild(date);
        post.comments.forEach((comment, index) => {
            let singleComment = document.createElement("li");
            let title = document.createElement("h5");
            let text = document.createElement("p");
            let user = document.createElement("p");
            let date = document.createElement("p");
            let deleteForm = document.createElement("form");
            deleteForm.action = `https://sheltered-anchorage-95159.herokuapp.com/admin/${post._id}/${index}`;
            deleteForm.method = "delete";
            let deleteInput = document.createElement("input");
            deleteInput.hidden = true;
            deleteInput.type = "number";
            deleteInput.name = "index";
            deleteInput.value = index;
            title.textContent = comment.title;
            text.textContent = comment.text;
            user.textContent = comment.user;
            date.textContent = comment.timestamp;
            singleComment.appendChild(title);
            singleComment.appendChild(text);
            singleComment.appendChild(user);
            singleComment.appendChild(date);
            commentList.appendChild(singleComment);
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