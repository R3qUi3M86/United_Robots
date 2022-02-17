let namespace = '/update'
let operator_socket = io.connect(document.domain + ':' + 5050 + namespace);
let web_socket = io.connect(document.domain + ':' + 5000 + namespace);
let display_update_interval = setInterval(updateRobot, 300)

async function updateRobot(){
    let response = await apiGet("/get_update");
    updateDisplay(response)
    web_socket.emit('update_status', response)
    operator_socket.emit('update_status', response)

}

web_socket.on('receive_conn', function (data){
    apiPost("/connection", data)
})

web_socket.on('connect_error', function (err){
    apiPost("/connection", {'internet_conn': false})
})

operator_socket.on('receive_conn', function (data){
    apiPost("/connection", data)
})

operator_socket.on('connect_error', function (err){
    apiPost("/connection", {'operator_conn': false})
})

operator_socket.on('receive_command', function (data) {
    console.log(data)
})

function updateDisplay(data){
    const internetStatusElement = document.getElementById("internet-conn-status");
    const operatorStatusElement = document.getElementById("operator-conn-status");
    const activityStatusElement = document.getElementById("activity-status");
    const positionStatusElement = document.getElementById("position-status");
    const mapListStatusElement = document.getElementById("loaded-maps-list");
    const usedMapStatusElement = document.getElementById("used-map");

    if (data['internet_conn']){
        internetStatusElement.classList.remove('bad-status');
        internetStatusElement.classList.add('good-status');
        internetStatusElement.innerText = 'UP';
    } else {
        internetStatusElement.classList.remove('good-status');
        internetStatusElement.classList.add('bad-status');
        internetStatusElement.innerText = 'DOWN';
    }

    if (data['operator_conn']){
        operatorStatusElement.classList.remove('bad-status');
        operatorStatusElement.classList.add('good-status');
        operatorStatusElement.innerText = 'UP';
    } else {
        operatorStatusElement.classList.remove('good-status');
        operatorStatusElement.classList.add('bad-status');
        operatorStatusElement.innerText = 'DOWN';
    }

    activityStatusElement.innerText = data['activity'];
    if (data['activity'] === "powered down") {
        activityStatusElement.classList.remove('good-status');
        activityStatusElement.classList.remove('neutral-status');
        activityStatusElement.classList.add('bad-status');
    } else if (data['activity'] === "idle"){
        activityStatusElement.classList.remove('bad-status');
        activityStatusElement.classList.remove('neutral-status');
        activityStatusElement.classList.add('good-status');
    } else {
        activityStatusElement.classList.remove('bad-status');
        activityStatusElement.classList.remove('good-status');
        activityStatusElement.classList.add('neutral-status');
    }

    positionStatusElement.innerText = data['position'].toString();

    if (data['loaded_maps'].length > 0){
        mapListStatusElement.classList.remove('bad-status');
        mapListStatusElement.classList.add('neutral-status');
        mapListStatusElement.innerText = data['loaded_maps'].toString();
    } else {
        mapListStatusElement.classList.add('bad-status');
        mapListStatusElement.classList.remove('neutral-status');
        mapListStatusElement.innerText = "NO MAP DATA!";
    }

    if (data['used_map']){
        usedMapStatusElement.classList.remove('bad-status');
        usedMapStatusElement.classList.add('neutral-status');
        usedMapStatusElement.innerText = data['used_map'];
    } else {
        usedMapStatusElement.classList.remove('neutral-status');
        usedMapStatusElement.classList.add('bad-status');
        usedMapStatusElement.innerText = "NO MAP DATA!";
    }

    appendLogInformation(data['log_report']);
}

function appendLogInformation(log){
    if (log) {
        const logWindow = document.getElementById('log-window');
        const paragraph = document.createElement('p');
        paragraph.classList.add('card-text');
        paragraph.innerText = log;
        if (logWindow.children.length === 7) {
            logWindow.removeChild(logWindow.children[0]);
        }
        logWindow.appendChild(paragraph);
    }
}

async function apiGet(url) {
    let response = await fetch(url, {
        method: "GET",
    });
    if (response.status === 200) {
        return response.json();
    }
}

async function apiPost(url, payload) {
    let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {'Content-Type': 'application/json'}
    });
    if (response.status === 200) {
        return response.json();
    }
}