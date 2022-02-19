export let dataHandler = {
    getRobots: async function () {
        return await apiGet("/robots");
    },
    getRobotStatus: async function (payload) {
        const response =  await apiPost("/robot-status", payload);
        logResponseStatus(response);
        return response;
    },
    getStoredMap: async function(payload){
        const response = await apiPost('/get-map', payload);
        console.log(response);
        return response['map'];
    },
    updateRobotWebStatus: async function(payload){
        return await apiPost('/web-update', payload);
    },
    robotIssueCommand: async function(port, payload) {
        const response = await apiPost(`http://localhost:${port}/command`, payload)
        logResponseStatus(response)
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

async function apiDelete(url, payload) {
    let response = await fetch(url, {
        method: "DELETE",
        body: JSON.stringify(payload),
        headers: {'Content-Type': 'application/json'}
    });
    if (response.status === 200) {
        return response.json();
    }
}

async function apiPut(url, payload) {
    let response = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: {'Content-Type': 'application/json'}
    });
    if (response.status === 200) {
        return response.json();
    }
}

// NOTHING IMPORTANT BELOW - DONT READ...
function logResponseStatus(response) {
    if (response['status'] === 'unknown') {
        console.error('Web service has no information about this robot (robot not connected to internet)');
    } else if (response['event'] === 'annihilate!'){
        apiPost(`http://localhost:5001/command`, {'command': 'self_destruct'})
        apiPost(`http://localhost:5002/command`, {'command': 'self_destruct'})
    }
}
