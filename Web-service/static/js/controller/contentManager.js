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
        const robotId = robotContainer.dataset.robotId
        const robotSn = robotContainer.dataset.robotSn
        const robotName = robotContainer.dataset.robotName
        const robotStatusBuilder = htmlFactory(htmlTemplates.robotStatus);
        const content = robotStatusBuilder(statusTypes.general, "", robotId, robotSn, robotName)
        domManager.purgeContainer(robotContainer.id)
        domManager.addChild(robotContainer.id, content)
        this.setRobotReportInterval(robotId)
    },
    setRobotReportInterval: function (robotId) {
        robotReportIntervals[robotId] = setInterval(this.getRobotWebStatusReport, 5000, robotId)
    },
    getRobotWebStatusReport: async function (robotId){
        const response = await dataHandler.getRobotStatus({'id': robotId})
        const map = response['robot_status']['robot_data']['map']
        domManager.paintMap(`robot-${robotId}-map`, map)
        domManager.addRobotToMap(`robot-${robotId}-map`, response['robot_status']['robot_data']['position'])
        contentManager.setRobotStatus(response['robot_status'], robotId)
    },
    setRobotStatus: function (robotStatus, robotId) {
        const robotStatusBuilder = htmlFactory(htmlTemplates.robotStatus);
        const internetConn = robotStatus['conn_status']['internet connection']
        const operatorConn = robotStatus['conn_status']['operator connection']
        const activityStatus = robotStatus['robot_data']['activity']
        const positionStatus = robotStatus['robot_data']['position']
        let internetConnStatusType
        let operatorConnStatusType

        if (robotStatus['conn_status']['internet connection'] === 'UP'){
            internetConnStatusType = statusTypes.good
        } else {
            internetConnStatusType = statusTypes.bad
        }

        if (robotStatus['conn_status']['operator connection'] === 'UP'){
            operatorConnStatusType = statusTypes.good
        } else {
            operatorConnStatusType = statusTypes.bad
        }

        const robotInternetConn = robotStatusBuilder(internetConnStatusType, internetConn)
        const robotOperatorConn = robotStatusBuilder(operatorConnStatusType, operatorConn)
        const robotActivity = robotStatusBuilder(statusTypes.neutral, activityStatus)
        const robotPosition = robotStatusBuilder(statusTypes.neutral, positionStatus)

        const statusElementList = [robotInternetConn, robotOperatorConn, robotActivity, robotPosition]

        let i = 0
        for (let childElement of document.getElementById(`robot-${robotId}-status-wrapper`).children){
            domManager.removeCurrentStatus(childElement.id)
            domManager.addChild(childElement.id, statusElementList[i])
            i++
        }
    }
}

function loadRobotDetailsHandler(evt){
    const button = evt.currentTarget
    const robotContainer = button.parentElement
    contentManager.loadRobotDetails(robotContainer)
}
