export const htmlTemplates = {
    robotContainer: 0,
    button: 1,
    robotStatus: 2,
}

export const buttonTypes = {
    robotBtn: "Robot details",
    closeBtn: "Back to main page",
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

function buttonBuilder(type, data, secData){
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

        case buttonTypes.closeBtn:
            const closeBtn = document.createElement('button');
            closeBtn.id = `robot-${data['id']}-close-btn`;
            closeBtn.classList.add('btn', 'btn-primary');
            closeBtn.setAttribute('data-robot-id', data['id']);
            closeBtn.setAttribute('data-robot-sn', data['robot_sn']);
            closeBtn.setAttribute('data-robot-name', data['robot_name']);
            closeBtn.innerText = 'Close';
            return closeBtn;

        case buttonTypes.sendMapDataBtn:
            const dropDownWrapper = document.createElement('div');
            const button = document.createElement('button')
            const dropDownMenu = document.createElement('ul');

            button.classList.add('btn', 'btn-primary')
            button.setAttribute('data-robot-id', data['id'])
            button.innerText = 'Upload Maps'

            dropDownWrapper.classList.add('dropdown');
            dropDownWrapper.appendChild(button);
            dropDownWrapper.appendChild(dropDownMenu);

            dropDownMenu.id = `robot-${data['id']}-drop-menu`
            dropDownMenu.classList.add('dropdown-menu', 'bg-light');
            dropDownMenu.setAttribute('aria-labelledby', `robot-${data['id']}-dropdown-container`);

            for (let mapId of secData){
                const menuListItem1 = document.createElement('li');
                const listActionMap1 = document.createElement('a');
                dropDownMenu.appendChild(menuListItem1);
                menuListItem1.appendChild(listActionMap1);
                listActionMap1.id = `robot-${data['id']}-upload-map-${mapId}`;
                listActionMap1.classList.add("dropdown-item");
                listActionMap1.setAttribute('data-robot-id', data['id'])
                listActionMap1.setAttribute('data-map-id', mapId)
                listActionMap1.onclick = function () {return false}
                listActionMap1.href = "#";
                listActionMap1.innerHTML = `Map-${mapId}`;
            }

            button.id = `robot-${data['id']}-upload-btn`;
            button.classList.add('dropdown-toggle');
            button.setAttribute('type', 'button');
            button.setAttribute('data-bs-toggle','dropdown');
            button.setAttribute('aria-expanded', 'false');

            return dropDownWrapper;
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
            const lowerUI = document.createElement('div')

            divWrapper.appendChild(description)
            divWrapper.appendChild(map)
            divWrapper.appendChild(robotStatus)
            divWrapper.appendChild(lowerUI)

            divWrapper.id = `robot-${robotId}-details-card`
            divWrapper.classList.add('card', 'px-3', 'py-3', 'my-3')

            description.classList.add('text-center', 'card-title');
            description.innerText = robotSn + ": " + robotName;

            map.id = `robot-${robotId}-map`;
            map.classList.add('container', 'border', 'border-dark', 'rounded');
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

            lowerUI.id = `robot-${robotId}-lower-ui`;
            lowerUI.classList.add('d-flex', 'mt-3', 'justify-content-between')

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