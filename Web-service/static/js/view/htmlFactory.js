export const htmlTemplates = {
    robotContainer: 0,
    button: 1,
    robotStatus: 2,
}

export const buttonTypes = {
    robotBtn: "Robot details",
    backToMainBtn: "Back to main page",
    sendMapDataBtn: "Send map data",
}

export const statusTypes = {
    general: "General status window",
    good: "Good status",
    neutral: "Neutral status",
    bad: "Bad status"
}

export function htmlFactory(template) {
    switch (template) {
        case htmlTemplates.robotContainer:
            return robotContainerBuilder;
        case htmlTemplates.button:
            return buttonBuilder;
        case htmlTemplates.robotStatus:
            return robotStatusBuilder;
        default:
            console.error("Undefined template: " + template);
            return () => { return "" };
    }
}

function robotContainerBuilder(data){
    const robot = document.createElement('div')
    robot.id = `${data['robot_sn']}-container`
    robot.classList.add('d-flex', 'justify-content-center')
    robot.setAttribute('data-robot-id', data['id'])
    robot.setAttribute('data-robot-sn', data['robot_sn'])
    robot.setAttribute('data-robot-name', data['robot_name'])
    return robot;
}

function buttonBuilder(type, data){
    switch (type) {
        case buttonTypes.robotBtn:
            const robotBtn = document.createElement('button');

            robotBtn.id = `${data['robot_sn']}-btn`
            robotBtn.classList.add('btn', 'btn-primary', 'mt-3');
            robotBtn.setAttribute('data-robot-id', data['id'])
            robotBtn.setAttribute('data-robot-sn', data['robot_sn'])
            robotBtn.setAttribute('data-robot-name', data['robot_name'])
            robotBtn.innerText = data['robot_sn'] + ": " + data['robot_name']
            return robotBtn

        case buttonTypes.backToMainBtn:

        case buttonTypes.sendMapDataBtn:
    }
}

function robotStatusBuilder(type, statusText,robotId, robotSn, robotName){
    switch (type) {
        case statusTypes.general:
            const divWrapper = document.createElement('div');
            const description = document.createElement('div');
            const map = document.createElement('div');
            const robotStatus = document.createElement('div');
            const internetConnStatus = document.createElement('div');
            const operatorConnStatus = document.createElement('div');
            const activityStatus = document.createElement('div');
            const positionStatus = document.createElement('div');
            const internetConnSpanTitle = document.createElement('span');
            const operatorConnSpanTitle = document.createElement('span');
            const activitySpanTitle = document.createElement('span');
            const positionSpanTitle = document.createElement('span');
            const internetConnSpan = document.createElement('span');
            const operatorConnSpan = document.createElement('span');
            const activitySpan = document.createElement('span');
            const positionSpan = document.createElement('span');

            divWrapper.appendChild(description)
            divWrapper.appendChild(map)
            divWrapper.appendChild(robotStatus)

            divWrapper.classList.add('card', 'px-3', 'py-3', 'my-3')

            description.classList.add('text-center', 'card-title');
            description.innerText = robotSn + ": " + robotName;

            map.id = `robot-${robotId}-map`;
            map.classList.add('container', 'border', 'border-primary', 'rounded');
            for (let i = 0; i < 10; i++) {
                const grid_row = document.createElement('div');
                map.appendChild(grid_row);
                grid_row.classList.add('row');
                for (let j = 0; j < 12; j++) {
                    const grid_cell = document.createElement('div');
                    grid_row.appendChild(grid_cell);
                    grid_cell.id = `robot-${robotId}-map-grid-${i}-${j}`;
                    grid_cell.classList.add('col-1', 'map-cell', 'obstacle');
                }
            }

            robotStatus.appendChild(internetConnStatus);
            robotStatus.appendChild(operatorConnStatus);
            robotStatus.appendChild(activityStatus);
            robotStatus.appendChild(positionStatus);

            internetConnStatus.appendChild(internetConnSpanTitle);
            internetConnStatus.appendChild(internetConnSpan);
            operatorConnStatus.appendChild(operatorConnSpanTitle);
            operatorConnStatus.appendChild(operatorConnSpan);
            activityStatus.appendChild(activitySpanTitle);
            activityStatus.appendChild(activitySpan);
            positionStatus.appendChild(positionSpanTitle);
            positionStatus.appendChild(positionSpan);

            robotStatus.id = `robot-${robotId}-status-wrapper`

            internetConnStatus.id = `robot-${robotId}-internet-conn-status`;
            operatorConnStatus.id = `robot-${robotId}-operator-conn-status`;
            activityStatus.id = `robot-${robotId}-activity-status`;
            positionStatus.id = `robot-${robotId}-position-status`;

            internetConnSpanTitle.innerHTML = "Internet Connection: ";
            operatorConnSpanTitle.innerHTML = "Operator Connection: ";
            activitySpanTitle.innerHTML = "Activity: ";
            positionSpanTitle.innerHTML = "Position: ";

            return divWrapper

        case statusTypes.good:
            const goodStatusSpan = document.createElement('span');
            goodStatusSpan.classList.add('good-status');
            goodStatusSpan.innerText = statusText;
            return goodStatusSpan;

        case statusTypes.neutral:
            const neutralStatusSpan = document.createElement('span');
            neutralStatusSpan.classList.add('neutral-status');
            neutralStatusSpan.innerText = statusText;
            return neutralStatusSpan;

        case statusTypes.bad:
            const badStatusSpan = document.createElement('span');
            badStatusSpan.classList.add('bad-status');
            badStatusSpan.innerText = statusText;
            return badStatusSpan;
    }
}