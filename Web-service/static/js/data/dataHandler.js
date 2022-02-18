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
    },
    getRobotMapsList: async function (port){
        return await apiGet(`http://localhost:${port}/maps`);
    },
    getServerMap: async function(payload){
        const response = await apiPost('/get-map', payload)
        return response['map_data']
    },
    uploadMapToRobot: async function(port, mapId){
        const payload = await dataHandler.getServerMap({'map_id': mapId})
        console.log(payload)
        payload['command'] = 'download'
        const response2 = apiPost(`http://localhost:${port}/command`, payload)
        logResponseStatus(response2)
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
    } else if (response['status'] === 'access denied'){
        console.error('Unauthorized user access! - request ignored')
    }
}
