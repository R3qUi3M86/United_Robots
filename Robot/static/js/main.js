let namespace = '/robot-update'
let operator_socket = io.connect(document.domain + ':' + 5050 + namespace);
let web_socket = io.connect(document.domain + ':' + 5000 + namespace);
let display_update_interval = setInterval(updateRobot, 300)
let webWifi = true
let opWifi = true
let connectedToWeb
let connectedToOp
let webReconnectInterval
let opReconnectInterval

async function updateRobot(){
    let response = await apiGet("/get_update");
    updateDisplay(response)
    if (connectedToWeb && (response['is_destroyed'] || !webWifi)){
        connectedToWeb = false;
        web_socket.disconnect();
    } else if (webWifi && connectedToWeb) {
        web_socket.emit('update_status', response);
    } else if (webWifi && !connectedToWeb && !response['is_destroyed'] && !webReconnectInterval){
        webReconnectInterval = setInterval(reconnectToWebSocket, 10000);
    } else {
        apiPost("/connection", {'internet_conn': false});
    }

    if (connectedToOp && (response['is_destroyed'] || !opWifi)){
        connectedToOp = false;
        operator_socket.disconnect();
    } else if (opWifi && connectedToOp){
        operator_socket.emit('update_status', response);
    } else if (opWifi && !connectedToOp && !response['is_destroyed'] && !opReconnectInterval){
        opReconnectInterval = setInterval(reconnectToWebSocket, 10000);
    } else {
        apiPost("/connection", {'operator_conn': false})
    }
}

web_socket.on('receive_conn', function (data){
    apiPost("/connection", data);
    connectedToWeb = true;
    clearInterval(webReconnectInterval);
    webReconnectInterval = undefined;
})

web_socket.on('connect_error', function (err){
    apiPost("/connection", {'internet_conn': false});
    connectedToWeb = false;
    if (!webReconnectInterval) {
        webReconnectInterval = setInterval(reconnectToWebSocket, 10000);
    }
})

operator_socket.on('receive_conn', function (data){
    apiPost("/connection", data);
    connectedToOp = true;
    clearInterval(opReconnectInterval)
    opReconnectInterval = undefined;
})

operator_socket.on('connect_error', function (err){
    apiPost("/connection", {'operator_conn': false});
    connectedToOp = false;
    if (!opReconnectInterval) {
        opReconnectInterval = setInterval(reconnectToOpSocket, 10000);
    }
})

function reconnectToWebSocket(){
    web_socket.connect()
}

function reconnectToOpSocket(){
    operator_socket.connect()
}

// operator_socket.on('receive_command', function (data) {
//     console.log(data)
//     issueCommand(data)
// })

// async function issueCommand(data){
//     const response = await apiPost("/command_robot", data);
//     if (response['status'] === 'ok') {
//         if (response['map_data']) {
//             if (webWifi && response['internet_conn']) {
//                 web_socket.emit('map_upload', {'map_id': data['map_id'], 'map_data': response['map_data']})
//             } else {
//                 console.error('Map upload failed - no internet connection!')
//             }
//         }
//     } else {
//         console.warn('Unauthorized user tried to issue command - refused!')
//     }
// }

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

    if (data['used_map_id']){
        usedMapStatusElement.classList.remove('bad-status');
        usedMapStatusElement.classList.add('neutral-status');
        usedMapStatusElement.innerText = data['used_map_id'];
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

document.getElementById('web-wifi').addEventListener('click', webWifiToggleHandler)
document.getElementById('operator-wifi').addEventListener('click', opWifiToggleHandler)

function webWifiToggleHandler(evt){
    const targetBtn = evt.currentTarget
    if (targetBtn.classList.contains('btn-success')){
        targetBtn.classList.remove('btn-success')
        targetBtn.classList.add('btn-danger')
        targetBtn.innerText = "Web WiFi OFF"
        webWifi = false
    } else {
        targetBtn.classList.remove('btn-danger')
        targetBtn.classList.add('btn-success')
        targetBtn.innerText = "Web WiFi ON"
        webWifi = true
        // web_socket.connect()
    }
}

function opWifiToggleHandler(evt){
    const targetBtn = evt.currentTarget
    if (targetBtn.classList.contains('btn-success')){
        targetBtn.classList.remove('btn-success')
        targetBtn.classList.add('btn-danger')
        targetBtn.innerText = "Op WiFi OFF"
        opWifi = false
    } else {
        targetBtn.classList.remove('btn-danger')
        targetBtn.classList.add('btn-success')
        targetBtn.innerText = "Op WiFi ON"
        opWifi = true
        // operator_socket.connect()
    }
}