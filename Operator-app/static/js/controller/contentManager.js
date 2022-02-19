import {htmlTemplates, buttonTypes, statusTypes, htmlFactory, directions} from "../view/htmlFactory.js";
import {dataHandler} from "../data/dataHandler.js";
import {domManager} from "../view/domManager.js";

let robotReportIntervals = {}
let mapCache = {}
let previousMap = {}
let robotMaps = {}
let robotPreviousMaps = {}
let robotLastPos = {}

const moveCommands = {
    up: 'U',
    down: 'D',
    left: 'L',
    right: 'R',
    grid: 'G'
}

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
        contentManager.addSetMapButton({'robot_id': robotId, 'robot_sn': robotSn});
        contentManager.addCloseButton({'robot_id': robotId, 'robot_sn': robotSn, 'robot_name': robotName});
        contentManager.addRobotActionButton(robotId);
        contentManager.addRobotStartButton(robotId);
        contentManager.addArrowButtons(robotId);
        this.getRobotOpStatusReport(robotId);
    },
    setRobotReportInterval: function (robotId) {
        robotReportIntervals[robotId] = setInterval(this.getRobotOpStatusReport, 1000, robotId)
    },
    clearRobotReportInterval: function (robotId){
        clearInterval(robotReportIntervals[robotId])
    },
    getRobotOpStatusReport: async function (robotId){
        const response = await dataHandler.getRobotStatus({'robot_id': robotId});
        robotMaps[robotId] = response['robot_status']['loaded_maps'];
        const map_id = response['robot_status']['used_map_id'];
        let map = await getCurrentMapData(map_id);
        const robotPos = response['robot_status']['position'];
        contentManager.paintMap(robotId, map);
        contentManager.updateRobotOnMap(robotId, robotPos);
        contentManager.setRobotStatus(response['robot_status'], robotId);
        contentManager.addSetMapList(robotId)
    },
    setRobotStatus: function (robotStatus, robotId) {
        const robotStatusBuilder = htmlFactory(htmlTemplates.robotStatus);
        const onOffButton = document.getElementById(`robot-${robotId}-on-off-btn`)
        const internetConn = robotStatus['internet_conn'];
        const operatorConn = robotStatus['operator_conn'];
        const activityStatus = robotStatus['activity'];
        const positionStatus = robotStatus['position'];
        const hasStarted = robotStatus['has_started'];
        let internetStatus
        let operatorStatus
        let internetConnStatusType;
        let operatorConnStatusType;


        if (hasStarted && (onOffButton.dataset.onOff === 'start')){
            onOffButton.remove();
            contentManager.addRobotShutdownButton(robotId);
        } else if (!hasStarted && (onOffButton.dataset.onOff === 'shutdown')){
            onOffButton.remove();
            contentManager.addRobotStartButton(robotId);
        }

        if (operatorConn){
            domManager.enableButton(`robot-${robotId}-on-off-btn`);
            if (document.getElementById(`robot-${robotId}-drop-menu-set`).children.length > 0){
                domManager.enableButton(`robot-${robotId}-set-btn`)
            } else {
                domManager.disableButton(`robot-${robotId}-set-btn`)
            }
            if (hasStarted){
                contentManager.enableRobotUIButtons(robotId)
            } else {
               contentManager.disableRobotUIButtons(robotId)
            }
        } else {
            contentManager.disableRobotUIButtons(robotId);
            domManager.disableButton(`robot-${robotId}-on-off-btn`);
            domManager.disableButton(`robot-${robotId}-set-btn`);
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
    enableRobotUIButtons: function (robotId){
        domManager.enableButton(`robot-${robotId}-action-btn`);
        domManager.enableButton(`robot-${robotId}-move-up`);
        domManager.enableButton(`robot-${robotId}-move-down`);
        domManager.enableButton(`robot-${robotId}-move-left`);
        domManager.enableButton(`robot-${robotId}-move-right`);
    },
    disableRobotUIButtons: function (robotId) {
        domManager.disableButton(`robot-${robotId}-action-btn`);
        domManager.disableButton(`robot-${robotId}-move-up`);
        domManager.disableButton(`robot-${robotId}-move-down`);
        domManager.disableButton(`robot-${robotId}-move-left`);
        domManager.disableButton(`robot-${robotId}-move-right`);
    },
    addSetMapButton: function (robotData){
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        const content = buttonBuilder(buttonTypes.setMapDataBtn, robotData);
        domManager.addChild(`robot-${robotData['robot_id']}-lower-ui-top`, content);
        domManager.disableButton(`robot-${robotData['robot_id']}-set-btn`)
    },
    addSetMapList: async function(robotId){
        if (robotMaps[robotId] && (robotPreviousMaps[robotId] === undefined || robotPreviousMaps[robotId].toString() !== robotMaps[robotId].toString())){
            const buttonBuilder = htmlFactory(htmlTemplates.button);
            robotPreviousMaps[robotId] = robotMaps[robotId].slice(0);
            domManager.purgeContainer(`robot-${robotId}-drop-menu-set`)
            for (let mapId of robotMaps[robotId]) {
                const content = buttonBuilder(buttonTypes.setMapDataListBtn, robotId, mapId);
                domManager.addChild(`robot-${robotId}-drop-menu-set`, content);
                domManager.addEventListener(
                    `robot-${robotId}-set-map-${mapId}`,
                    "click",
                    robotSetMapCommandHandler);
            }
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
    addRobotActionButton: function (robotId){
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        const content = buttonBuilder(buttonTypes.robotActionBtn, robotId);
        domManager.insertFirstChild(`robot-${robotId}-lower-ui-middle`, content);
        domManager.addEventListener(
            `robot-${robotId}-action-btn`,
            "click",
            robotActionCommandHandler);
    },
    addRobotStartButton: function (robotId){
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        const content = buttonBuilder(buttonTypes.startRobotBtn, robotId);
        domManager.insertFirstChild(`robot-${robotId}-lower-ui-bottom`, content);
        domManager.addEventListener(
            `robot-${robotId}-on-off-btn`,
            "click",
            robotStartCommandHandler);
    },
    addRobotShutdownButton: function (robotId){
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        const content = buttonBuilder(buttonTypes.shutdownRobotBtn, robotId);
        domManager.insertFirstChild(`robot-${robotId}-lower-ui-bottom`, content);
        domManager.addEventListener(
            `robot-${robotId}-on-off-btn`,
            "click",
            robotShutdownCommandHandler);
    },
    addArrowButtons: function (robotId){
        const buttonBuilder = htmlFactory(htmlTemplates.button);
        const upArrow = buttonBuilder(buttonTypes.arrowBtn, robotId, directions.up);
        const downArrow = buttonBuilder(buttonTypes.arrowBtn, robotId, directions.down);
        const leftArrow = buttonBuilder(buttonTypes.arrowBtn, robotId, directions.left);
        const rightArrow = buttonBuilder(buttonTypes.arrowBtn, robotId, directions.right);
        const arrowBtns = [upArrow, downArrow, leftArrow, rightArrow];
        domManager.addChild(`robot-${robotId}-lower-ui-top`, upArrow);
        domManager.addChild(`robot-${robotId}-lower-ui-middle-right`, leftArrow);
        domManager.addChild(`robot-${robotId}-lower-ui-middle-right`, rightArrow);
        domManager.addChild(`robot-${robotId}-lower-ui-bottom`, downArrow);
        for (let arrowBtn of arrowBtns){
            const moveDir = arrowBtn.dataset.moveDir;
            domManager.addEventListener(
            `robot-${robotId}-move-${moveDir}`,
            "click",
            robotMoveCommandHandler);
        }
    },
    paintMap: function (robotId, map){
        if (map) {
            if (!previousMap[robotId] || (previousMap[robotId].toString() !== map.toString())) {
                domManager.paintMap(`robot-${robotId}-map`, map);
            }
            previousMap[robotId] = map.slice(0);
        }
    },
    updateRobotOnMap: function (robotId, robotPos) {
        if (robotPos !== 'unknown'){
            domManager.updateRobotOnMap(`robot-${robotId}-map`, robotPos, robotLastPos[robotId]);
            robotLastPos[robotId] = robotPos
        }
    }
}

function loadRobotDetailsHandler(evt){
    const button = evt.currentTarget;
    const robotContainer = button.parentElement;
    contentManager.loadRobotDetails(robotContainer);
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
    delete robotMaps[robotId]
    delete robotPreviousMaps[robotId]
    delete robotLastPos[robotId]
    delete previousMap[robotId]
}

async function getCurrentMapData(map_id){
    if (map_id) {
        let map
        if (!(map_id in mapCache)) {
            if (mapCache[map_id]) {
                map = mapCache[map_id];
            } else {
                mapCache[map_id] = undefined;
                map = await dataHandler.getStoredMap({'map_id': map_id});
                mapCache[map_id] = map;
            }
        } else {
            map = mapCache[map_id]
        }
        return map
    }
}

function robotSetMapCommandHandler(evt){
    const robotId = evt.currentTarget.dataset.robotId
    const mapId = evt.currentTarget.dataset.mapId
    dataHandler.robotIssueCommand(5000+parseInt(robotId), {'command': 'use_map', 'map_id': parseInt(mapId)})
}

function robotActionCommandHandler(evt){
    const target = evt.currentTarget;
    const robotId = target.dataset.robotId;
    dataHandler.robotIssueCommand(5000+parseInt(robotId), {'command': 'do'});
}

function robotStartCommandHandler(evt){
    const target = evt.currentTarget;
    const robotId = target.dataset.robotId;
    dataHandler.robotIssueCommand(5000+parseInt(robotId), {'command': 'power_on'});
}

function robotShutdownCommandHandler(evt){
    const target = evt.currentTarget;
    const robotId = target.dataset.robotId;
    dataHandler.robotIssueCommand(5000+parseInt(robotId), {'command': 'power_off'});
}

function robotMoveCommandHandler(evt){
    const target = evt.currentTarget;
    const robotId = target.dataset.robotId;
    const moveDir = moveCommands[target.dataset.moveDir];
    dataHandler.robotIssueCommand(5000+parseInt(robotId), {'command': 'move', 'move_dir': moveDir});
}