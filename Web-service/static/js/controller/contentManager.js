import {htmlTemplates, buttonTypes, statusTypes, htmlFactory} from "../view/htmlFactory.js";
import {dataHandler} from "../data/dataHandler.js";
import {domManager} from "../view/domManager.js";

let robotReportIntervals = {}
let map_cache = {}
let robotLastPos

export let contentManager = {
    loadRobots: async function () {
        const robotsData = await dataHandler.getRobots();
        for (let robotData of robotsData) {
            const robotContainerBuilder = htmlFactory(htmlTemplates.robotContainer);
            const content = robotContainerBuilder(robotData);
            domManager.addChild("robots-container", content);
            this.addRobotDetailsBtn(robotData);
        }
    },
    addRobotDetailsBtn: function (robotData) {
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        const content = buttonBuilder(buttonTypes.robotBtn, robotData);
        domManager.addChild(`${robotData['robot_sn']}-container`, content);
        domManager.addEventListener(
            `${robotData['robot_sn']}-btn`,
            "click",
            loadRobotDetailsHandler
            );
    },
    loadRobotDetails: async function (robotContainer) {
        const robotId = robotContainer.dataset.robotId;
        const robotSn = robotContainer.dataset.robotSn;
        const robotName = robotContainer.dataset.robotName;
        const robotStatusBuilder = htmlFactory(htmlTemplates.robotStatus);
        const content = robotStatusBuilder(statusTypes.general, "", robotId, robotSn, robotName);
        domManager.purgeContainer(robotContainer.id);
        domManager.addChild(robotContainer.id, content);
        this.setRobotReportInterval(robotId);
        contentManager.addUploadMapButton({'robot_id': robotId, 'robot_sn': robotSn});
        contentManager.addDownloadMapButton({'robot_id': robotId, 'robot_sn': robotSn});
        contentManager.addCloseButton({'robot_id': robotId, 'robot_sn': robotSn, 'robot_name': robotName});
        this.getRobotWebStatusReport(robotId)
    },
    setRobotReportInterval: function (robotId) {
        robotReportIntervals[robotId] = setInterval(this.getRobotWebStatusReport, 5000, robotId)
    },
    clearRobotReportInterval: function (robotId){
        clearInterval(robotReportIntervals[robotId])
    },
    getRobotWebStatusReport: async function (robotId){
        const response = await dataHandler.getRobotStatus({'robot_id': robotId});
        const map_id = response['robot_status']['used_map_id'];
        let map = await getCurrentMapData(map_id);
        const robotPos = response['robot_status']['position'];
        contentManager.paintMap(robotId, map);
        contentManager.updateRobotOnMap(robotId, robotPos, robotLastPos);
        contentManager.setRobotStatus(response['robot_status'], robotId);
    },
    setRobotStatus: function (robotStatus, robotId) {
        const robotStatusBuilder = htmlFactory(htmlTemplates.robotStatus);
        const internetConn = robotStatus['internet_conn'];
        const operatorConn = robotStatus['operator_conn'];
        const activityStatus = robotStatus['activity'];
        const positionStatus = robotStatus['position'];
        let internetStatus
        let operatorStatus
        let internetConnStatusType;
        let operatorConnStatusType;

        if (internetConn){
            domManager.enableButton(`robot-${robotId}-upload-btn`)
            domManager.enableButton(`robot-${robotId}-download-btn`)
        } else {
            domManager.disableButton(`robot-${robotId}-upload-btn`)
            domManager.disableButton(`robot-${robotId}-download-btn`)
        }

        if (internetConn){
            internetStatus = "UP"
            internetConnStatusType = statusTypes.good;
        } else {
            internetStatus = "DOWN"
            internetConnStatusType = statusTypes.bad;
        }

        if (operatorConn){
            operatorStatus = "UP"
            operatorConnStatusType = statusTypes.good;
        } else {
            operatorStatus = "DOWN"
            operatorConnStatusType = statusTypes.bad;
        }

        const robotInternetConn = robotStatusBuilder(internetConnStatusType, internetStatus);
        const robotOperatorConn = robotStatusBuilder(operatorConnStatusType, operatorStatus);
        const robotActivity = robotStatusBuilder(statusTypes.neutral, activityStatus);
        const robotPosition = robotStatusBuilder(statusTypes.neutral, positionStatus);

        const statusElementList = [robotInternetConn, robotOperatorConn, robotActivity, robotPosition];
        let i = 0
        for (let childElement of document.getElementById(`robot-${robotId}-status-wrapper`).children){
            domManager.removeCurrentStatus(childElement.id);
            domManager.addChild(childElement.id, statusElementList[i]);
            i++;
        }
    },
    addUploadMapButton: function (robotData){
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        const content = buttonBuilder(buttonTypes.sendMapDataBtn, robotData);
        domManager.addChild(`robot-${robotData['robot_id']}-lower-ui`, content);
        domManager.disableButton(`robot-${robotData['robot_id']}-upload-btn`)
        contentManager.addUploadMapList(robotData)
    },
    addDownloadMapButton: function (robotData){
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        const content = buttonBuilder(buttonTypes.getMapDataBtn, robotData);
        domManager.addChild(`robot-${robotData['robot_id']}-lower-ui`, content);
        domManager.disableButton(`robot-${robotData['robot_id']}-download-btn`)
        contentManager.addDownloadMapList(robotData)
    },
    addUploadMapList: async function(robotData){
        const mapList = await dataHandler.getMapsList()
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        console.log(mapList)
        for (let mapId of mapList){
            const content = buttonBuilder(buttonTypes.sendMapDataListBtn, robotData, mapId);
            domManager.addChild(`robot-${robotData['robot_id']}-drop-menu-upload`, content);
            domManager.addEventListener(
                `robot-${robotData['robot_id']}-upload-map-${mapId}`,
                "click",
                uploadMapHandler);
        }
    },
    addDownloadMapList: async function(robotData){
        const mapList = await dataHandler.getRobotMapsList(5000+parseInt(robotData['robot_id']))
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        for (let mapId of mapList){
            const content = buttonBuilder(buttonTypes.getMapDataListBtn, robotData, mapId);
            domManager.addChild(`robot-${robotData['robot_id']}-drop-menu-download`, content);
            domManager.addEventListener(
                `robot-${robotData['robot_id']}-download-map-${mapId}`,
                "click",
                downloadMapHandler);
        }
    },
    addCloseButton: function (robotData){
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        const content = buttonBuilder(buttonTypes.closeBtn, robotData);
        domManager.addChild(`robot-${robotData['robot_id']}-header`, content);
        domManager.addEventListener(
            `robot-${robotData['robot_id']}-close-btn`,
            "click",
            closeRobotDetailsHandler);
    },
    paintMap: function (robotId, map){
        if (map){
            domManager.paintMap(`robot-${robotId}-map`, map);
        }
    },
    updateRobotOnMap: function (robotId, robotPos) {
        if (robotPos !== 'unknown'){
            domManager.updateRobotOnMap(`robot-${robotId}-map`, robotPos, robotLastPos);
            robotLastPos = robotPos
        }
    }
}

function loadRobotDetailsHandler(evt){
    const button = evt.currentTarget;
    const robotContainer = button.parentElement;
    contentManager.loadRobotDetails(robotContainer);
}

function uploadMapHandler(evt){
    const targetBtn = evt.currentTarget
    const robotId = targetBtn.dataset.robotId
    const mapId = targetBtn.dataset.mapId
    dataHandler.uploadMapToRobot(5000+parseInt(robotId), mapId)
}

function downloadMapHandler(evt){

}

function closeRobotDetailsHandler(evt){
    const button = evt.currentTarget;
    const robotId = button.dataset.robotId;
    const robotSn = button.dataset.robotSn;
    const robotName = button.dataset.robotName;
    const data = {'robot_id': robotId, 'robot_sn': robotSn, 'robot_name': robotName}
    domManager.purgeContainer(`${robotSn}-container`)
    contentManager.clearRobotReportInterval(robotId)
    contentManager.addRobotDetailsBtn(data)
}

async function getCurrentMapData(map_id){
    if (map_id) {
        let map
        if (!(map_id in map_cache)) {
            if (map_cache[map_id]) {
                map = map_cache[map_id];
            } else {
                map_cache[map_id] = undefined;
                const map_data = await dataHandler.getServerMap({'map_id': map_id});
                map_cache[map_id] = map_data['map'];
            }
        }
        return map
    }
}
