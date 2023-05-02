const backendIPAddress = "localhost:3000"
let username = ""

const login = () => {
    console.log("logging in")
    window.location.href = `http://${backendIPAddress}/courseville/auth_app`;
}

const logout = () => {
    window.location.href = `http://${backendIPAddress}/courseville/logout`;
}

const fetchUsername = async () => {
    const options = {
        method: "GET",
        credentials: "include",
    };
    await fetch(`http://${backendIPAddress}/courseville/get_profile_info`, options)
        .then((response) => {
            if (response.ok)
                return response.json()
            else
                throw new Error("not logged in")
        })
        .then((data) => {
            console.log(data)
            username = data["data"]["student"]["id"]
            logged_in = true
        })
        .catch((error) => console.log(error));
}

/*
const options = {
        method: "GET",
        credentials: "include",
    };
await fetch(`http://${backendIPAddress}/courseville/get_profile_info`, options)
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
            })
            .catch((error) => console.log(error));
*/

const fetchAssignmentDetail = async (itemId) => {
    const options = {
        method: "GET",
        credentials: "include",
    };
    let data = await fetch(`http://${backendIPAddress}/courseville/get_assignment_detail/${itemId}`, options)
        .then((response) => response.json())
    return data
}

const fetchClassTasks = async (classId) => {
    const options = {
        method: "GET",
        credentials: "include",
    };
    let tasks = []
    let className = await fetchClassName(classId)
    let data = await fetch(`http://${backendIPAddress}/courseville/get_course_assignments/${classId}`, options)
        .then((response) => response.json())
    for (let e of data["data"]) {
        let id = e["itemid"]
        const task = await fetchAssignmentDetail(id)
        tasks.push({ "date": task["data"]["duedate"], "title": task["data"]["title"], "desc": className })
    }
    return tasks
}

const fetchClassName = async (classId) => {
    const options = {
        method: "GET",
        credentials: "include",
    };
    let data = await fetch(`http://${backendIPAddress}/courseville/get_course_info/${classId}`, options)
        .then((response) => response.json())
    return data["data"]["title"]
}

const fetchMCVTasks = async () => {

    const options = {
        method: "GET",
        credentials: "include",
    };
    let data = await fetch(`http://${backendIPAddress}/courseville/get_courses`, options)
        .then((response) => response.json())
    let l = []
    let classes = data["data"]["student"]
    const latest = classes.at(-1)
    const curSemester = latest["semester"]
    const curYear = latest["year"]
    classes = classes.filter(x => x["semester"] == curSemester && x["year"] == curYear)
    for (let e of classes) {
        let id = e["cv_cid"]
        let tasks = await fetchClassTasks(id)
        l = l.concat(tasks)
        console.log(l)
    }
    return l
}

const fetchDatabase = async () => {
    const options = {
        method: "GET",
        credentials: "include",
    };
    let data = await fetch(`http://${backendIPAddress}/items/${username}`, options)
        .then((response) => response.json())
    return data
}

const updateItem = async (itemId, title, desc, date) => {
    const data = {
        title: title,
        desc: desc,
        date: date
    }
    const options = {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };
    await fetch(`http://${backendIPAddress}/items/${itemId}/${username}`, options)
}

// const doStuff = async () => {
//     let l = await fetchMCVTasks().then((data) => data)
//     // let l = await fetchClassName("32205")
//     // l.sort((a, b) => a["date"] - b["date"])
//     console.log(l)
// }

// fetchUsername()


const removeItem = async (itemId) => {
    const options = {
        method: "DELETE",
        credentials: "include",
    }
    await fetch(`http://${backendIPAddress}/items/${itemId}/${username}`, options)
}

const createItem = async (title, desc, date) => {
    const data = {
        title: title,
        desc: desc,
        date: date
    }
    const options = {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        },
    }
    await fetch(`http://${backendIPAddress}/items/${username}`, options)
}