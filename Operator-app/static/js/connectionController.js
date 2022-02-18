import {dataHandler} from "./data/dataHandler.js";

let namespace = '/operator-update'
let web_socket = io.connect(document.domain + ':' + 5000 + namespace);
let own_socket = io.connect(document.domain + ':' + 5050 + namespace);
let webWifi = true
let connectedToWeb
let webReconnectInterval

web_socket.on('receive_conn', function (){
    connectedToWeb = true;
    console.info('Connected to web-service')
    clearInterval(webReconnectInterval)
})

web_socket.on('connect_error', function (err){
    connectedToWeb = false;
    const data = {'status': 'operator_lost_web_connection'}
    dataHandler.updateRobotWebStatus(data)
    if (!webReconnectInterval) {
        webReconnectInterval = setInterval(reconnectToWebSocket, 10000);
    }
})

web_socket.on('receive_update', function (data){
    dataHandler.updateRobotWebStatus(data)
})

own_socket.on('receive_robot_update', function (data){
    exchangeRobotStatusWithWeb(data)
})

function reconnectToWebSocket(){
    web_socket.connect()
}

function exchangeRobotStatusWithWeb(data){
    if (webWifi && connectedToWeb) {
        web_socket.emit('update_status', data)
    }
}
