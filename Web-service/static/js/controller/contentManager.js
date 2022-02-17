import {htmlTemplates, buttonTypes, statusTypes, htmlFactory} from "../view/htmlFactory.js";
import {dataHandler} from "../data/dataHandler.js";
import {domManager} from "../view/domManager.js";

let robotReportIntervals = {}

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
        await contentManager.addUploadMapButton({'id': robotId, 'robot_sn': robotSn});
        contentManager.addCloseButton({'id': robotId, 'robot_sn': robotSn, 'robot_name': robotName});
        this.getRobotWebStatusReport(robotId)
    },
    setRobotReportInterval: function (robotId) {
        robotReportIntervals[robotId] = setInterval(this.getRobotWebStatusReport, 5000, robotId)
    },
    clearRobotReportInterval: function (robotId){
        clearInterval(robotReportIntervals[robotId])
    },
    getRobotWebStatusReport: async function (robotId){
        const response = await dataHandler.getRobotStatus({'id': robotId});
        const map = response['robot_status']['used_map'];
        const robotPos = response['robot_status']['position'];
        contentManager.paintMap(robotId, map);
        contentManager.addRobotToMap(robotId, robotPos);
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

        console.log(internetConn)
        if (internetConn){
            domManager.enableButton(`robot-${robotId}-upload-btn`)
        } else {
            domManager.disableButton(`robot-${robotId}-upload-btn`)
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
    addUploadMapButton: async function (robotData){
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        const mapList = await dataHandler.getMapsList()
        const content = buttonBuilder(buttonTypes.sendMapDataBtn, robotData, mapList);
        domManager.addChild(`robot-${robotData['id']}-lower-ui`, content);
        domManager.disableButton(`robot-${robotData['id']}-upload-btn`)
        for (let mapId of mapList){
            domManager.addEventListener(
                `robot-${robotData['id']}-upload-map-${mapId}`,
                "click",
                uploadMapHandler);
        }
    },
    addCloseButton: function (robotData){
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        const content = buttonBuilder(buttonTypes.closeBtn, robotData);
        domManager.addChild(`robot-${robotData['id']}-lower-ui`, content);
        domManager.addEventListener(
            `robot-${robotData['id']}-close-btn`,
            "click",
            closeRobotDetailsHandler);
    },
    paintMap: function (robotId, map){
        if (map){
            domManager.paintMap(`robot-${robotId}-map`, map);
        }
    },
    addRobotToMap: function (robotId, robotPos) {
        if (robotPos !== 'unknown'){
            domManager.addRobotToMap(`robot-${robotId}-map`, robotPos);
        }
    }
}

function loadRobotDetailsHandler(evt){
    const button = evt.currentTarget;
    const robotContainer = button.parentElement;
    contentManager.loadRobotDetails(robotContainer);
}

function uploadMapHandler(evt){

}

function closeRobotDetailsHandler(evt){
    const button = evt.currentTarget;
    const robotId = button.dataset.robotId;
    const robotSn = button.dataset.robotSn;
    const robotName = button.dataset.robotName;
    const data = {'id': robotId, 'robot_sn': robotSn, 'robot_name': robotName}
    domManager.purgeContainer(`${robotSn}-container`)
    contentManager.clearRobotReportInterval(robotId)
    contentManager.addRobotDetailsBtn(data)
}
