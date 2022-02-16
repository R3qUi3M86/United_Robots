export let dataHandler = {
    getRobots: async function () {
        return await apiGet("/robots");
    },
    getRobotStatus: async function (payload) {
        const response =  await apiPost("/robot-status", payload);
        logResponseStatus(response)
        return response
    },
    getMapsList: async function (){
        return await apiGet("/maps");
    }
    // createNewBoard: async function (payload) {
    //     const response = await apiPost(`/api/boards/new`, payload);
    //     logResponseStatus(response)
    //     return response;
    // },
    // changeCardPosition: async function (payload) {
    //     const response = await apiPut(`/api/card/updatePosition`, payload)
    //     return response
    // },
    // deleteCard: async function (payload) {
    //     const response = await apiDelete(`/api/card/deleteCard`, payload)
    //     return response
    // }
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

function logResponseStatus(response) {
    if (response['status'] === 'unknown') {
        console.error('Web service has no information about this robot (robot not connected to internet)');

    }
}
