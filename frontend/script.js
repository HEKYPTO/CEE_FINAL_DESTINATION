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

const yyyymmdd = (date) => {
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();

    return [date.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
    ].join('-');
};

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
    const now = yyyymmdd(new Date())
    for (let e of data["data"]) {
        let id = e["itemid"]
        const task = await fetchAssignmentDetail(id)
        const f = { "date": task["data"]["duedate"], "title": task["data"]["title"], "desc": className }
        tasks.push(f)
        if (f["date"] >= now) {
            let tmp = `<div class="box">`;
            tmp += `<h1>${f["title"]}</h1>`;
            tmp += `<p>${f["desc"]}</p>`;
            tmp += `<p>${f["date"]}</p>`;
            tmp += `</div>`;
            document.getElementById("cardList").innerHTML += tmp
        }
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

//!!
const validateFill = () => {
    const task = document.getElementById("txt_task").value.trim()
    if (!task) {
        return false
    }

    return true
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

let id_editing = ""
let state = ""
let logged_in = false

let filtered = []

function closePopup() {
    document.getElementById("popup").style.display = "none";
    id_editing = ""
    state = ""
}

function showPopup2(mode, id = "") { //mode will be implement by other function
    const popup = document.getElementById("popup");
    if (mode === "create") {
        state = "create"
        document.getElementById("btn_delete").style.display = "none"
        document.getElementById("dialog_title").innerText = "Create Task"
        document.getElementById("txt_task").value = "";
        document.getElementById("txt_desc").value = "";
        document.getElementById("date_picker").value = yyyymmdd(new Date());
    } else if (mode === "edit") {
        id_editing = id
        state = "edit"
        const task = data.find((e) => e.item_id === id_editing)
        document.getElementById("btn_delete").style.display = "block"
        document.getElementById("dialog_title").innerText = "Edit Task"
        document.getElementById("txt_task").value = task.title;
        document.getElementById("txt_desc").value = task.desc;
        document.getElementById("date_picker").value = task.date;
    }
    popup.style.display = "block";
}

async function saveChanges() {
    const title = document.getElementById("txt_task").value;
    const desc = document.getElementById("txt_desc").value;
    const date = document.getElementById("date_picker").value;

    if (state === "edit") {
        console.log("EDITING")
        await updateItem(id_editing, title, desc, date);
    } else if (state === "create") {
        await createItem(title, desc, date);
    }
}

const submitHandler = async () => {
    if (validateFill()) {
        console.log("OK!")
        await saveChanges()
        await updateData();
        await searchHandler();
        await updateUI();
        closePopup();
    } else {
        alert("Fill in things first!!")
    }
}

const deleteHandler = async () => {
    await removeItem(id_editing);
    await updateData();
    await searchHandler();
    await updateUI();
    closePopup();
}

let data1 = [];
let data2 = [];
let data = []

const searchHandler = () => {
    const searchValue = document.getElementById("searchbox").value.trim().toLowerCase();
    updateFilter(searchValue);
    updateUI();
}

const updateData = async (mcv = false) => {
    data1 = await fetchDatabase()
    if (mcv) {
        document.getElementById("cardList").innerHTML = ""
        data2 = await fetchMCVTasks()
        document.getElementById("cardList").innerHTML = ""
    }
    data = data1.concat(data2)
    const now = yyyymmdd(new Date())
    console.log(now)
    data = data.filter((x) => {
        console.log(x)
        return x.date >= now
    })
}

const updateFilter = (searchTerm) => {
    if (searchTerm === "") {
        filtered = data;
    } else {
        console.log("update filter hit")
        filtered = data.filter((item) => {
            return (
                item.title.toLowerCase().includes(searchTerm) ||
                item.desc.toLowerCase().includes(searchTerm) ||
                item.date.toLowerCase().includes(searchTerm)
            );
        });
    }
}

// updateData updateFilter

const updateUI = async (mcv = false) => {
    const innerHTML = filtered.sort((a, b) =>
        a.date.localeCompare(b.date)
    ).map((e) => {
        let tmp = `<div class="box" ${e.item_id !== undefined ? `onclick="showPopup2('edit','${e.item_id}')" style="cursor:pointer;"` : ""}>`;
        tmp += `<h1>${e["title"]}</h1>`;
        tmp += `<p>${e["desc"]}</p>`;
        tmp += `<p>${e["date"]}</p>`;
        tmp += `</div>`;
        return tmp;
    }).join('')
    console.log(innerHTML)
    document.getElementById("cardList").innerHTML = innerHTML;
}

const init = async () => {
    await fetchUsername();
    if (logged_in) {
        const logbtn = document.getElementById("btn_login")
        logbtn.innerText = "Logout"
        logbtn.onclick = () => {
            logout()
        }
    } else {
        document.getElementById("searchbox").style.display = 'none'
        document.getElementById("btn_green").style.display = 'none'
        document.getElementById("main_title").innerText = "Please Login with your MCV account first."

    }
    document.getElementById("loading_text").style.display = 'block'
    document.getElementById("btn_green").style.display = 'none'
    document.getElementById("searchbox").disabled = true;
    await updateData(true) //change this back to TRUE
    document.getElementById("loading_text").style.display = 'none'
    document.getElementById("btn_green").style.display = 'block'
    document.getElementById("searchbox").disabled = false;
    await updateFilter("")
    await updateUI()
}