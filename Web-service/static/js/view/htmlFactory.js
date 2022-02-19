export const htmlTemplates = {
    robotContainer: 0,
    button: 1,
    robotStatus: 2,
}

export const buttonTypes = {
    robotBtn: "Robot details",
    closeBtn: "Back to main page",
    sendMapDataBtn: "Send map data",
    getMapDataBtn: "Get map data",
    sendMapDataListBtn: "Send map data list btn",
    getMapDataListBtn: "Get map data list btn"
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
    robot.setAttribute('data-robot-id', data['robot_id'])
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
            robotBtn.setAttribute('data-robot-id', data['robot_id'])
            robotBtn.setAttribute('data-robot-sn', data['robot_sn'])
            robotBtn.setAttribute('data-robot-name', data['robot_name'])
            robotBtn.innerText = data['robot_sn'] + ": " + data['robot_name']
            return robotBtn

        case buttonTypes.closeBtn:
            const closeBtn = document.createElement('button');
            closeBtn.id = `robot-${data['robot_id']}-close-btn`;
            closeBtn.classList.add('btn', 'btn-primary');
            closeBtn.setAttribute('data-robot-id', data['robot_id']);
            closeBtn.setAttribute('data-robot-sn', data['robot_sn']);
            closeBtn.setAttribute('data-robot-name', data['robot_name']);
            closeBtn.innerText = 'Close';
            return closeBtn;

        case buttonTypes.sendMapDataBtn:
            const dropDownWrapper = document.createElement('div');
            const button = document.createElement('button')
            const dropDownMenu = document.createElement('ul');

            button.id = `robot-${data['robot_id']}-upload-btn`;
            button.classList.add('btn', 'btn-primary', 'dropdown-toggle')
            button.setAttribute('data-robot-id', data['robot_id'])
            button.setAttribute('type', 'button');
            button.setAttribute('data-bs-toggle','dropdown');
            button.setAttribute('aria-expanded', 'false');
            button.innerText = 'Web Maps -> Robot'

            dropDownWrapper.classList.add('dropdown');
            dropDownWrapper.appendChild(button);
            dropDownWrapper.appendChild(dropDownMenu);

            dropDownMenu.id = `robot-${data['robot_id']}-drop-menu-upload`
            dropDownMenu.classList.add('dropdown-menu', 'bg-light');
            dropDownMenu.setAttribute('aria-labelledby', `robot-${data['robot_id']}-dropdown-container`);

            return dropDownWrapper;

        case buttonTypes.sendMapDataListBtn:
            const menuListItem = document.createElement('li');
            const listActionMap = document.createElement('a');
            menuListItem.appendChild(listActionMap);
            listActionMap.id = `robot-${data['robot_id']}-upload-map-${secData}`;
            listActionMap.classList.add("dropdown-item");
            listActionMap.setAttribute('data-robot-id', data['robot_id'])
            listActionMap.setAttribute('data-map-id', secData)
            listActionMap.onclick = function () {return false}
            listActionMap.href = "#";
            listActionMap.innerHTML = `Map-${secData}`;

            return menuListItem;

        case buttonTypes.getMapDataBtn:
            const dropDownWrapperGet = document.createElement('div');
            const buttonGet = document.createElement('button')
            const dropDownMenuGet = document.createElement('ul');

            buttonGet.id = `robot-${data['robot_id']}-download-btn`;
            buttonGet.classList.add('btn', 'btn-primary', 'dropdown-toggle')
            buttonGet.setAttribute('data-robot-id', data['robot_id'])
            buttonGet.setAttribute('type', 'button');
            buttonGet.setAttribute('data-bs-toggle','dropdown');
            buttonGet.setAttribute('aria-expanded', 'false');
            buttonGet.innerText = 'Robot Maps -> Web'

            dropDownWrapperGet.classList.add('dropdown');
            dropDownWrapperGet.appendChild(buttonGet);
            dropDownWrapperGet.appendChild(dropDownMenuGet);

            dropDownMenuGet.id = `robot-${data['robot_id']}-drop-menu-download`
            dropDownMenuGet.classList.add('dropdown-menu', 'bg-light');
            dropDownMenuGet.setAttribute('aria-labelledby', `robot-${data['robot_id']}-dropdown-container`);

            return dropDownWrapperGet;

        case buttonTypes.getMapDataListBtn:
            const menuListItemGet = document.createElement('li');
            const listActionMapGet = document.createElement('a');
            menuListItemGet.appendChild(listActionMapGet);
            listActionMapGet.id = `robot-${data['robot_id']}-download-map-${secData}`;
            listActionMapGet.classList.add("dropdown-item");
            listActionMapGet.setAttribute('data-robot-id', data['robot_id'])
            listActionMapGet.setAttribute('data-map-id', secData)
            listActionMapGet.onclick = function () {return false}
            listActionMapGet.href = "#";
            listActionMapGet.innerHTML = `Map-${secData}`;

            return menuListItemGet;
    }
}

function robotStatusBuilder(type, statusText,robotId, robotSn, robotName){
    switch (type) {
        case statusTypes.general:
            const divWrapper = document.createElement('div');
            const headerWrapper = document.createElement('div');
            const description = document.createElement('span');
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

            divWrapper.appendChild(headerWrapper)
            divWrapper.appendChild(map)
            divWrapper.appendChild(robotStatus)
            divWrapper.appendChild(lowerUI)

            divWrapper.id = `robot-${robotId}-details-card`;
            divWrapper.classList.add('card', 'px-3', 'py-3', 'my-3');

            headerWrapper.id = `robot-${robotId}-header`;
            headerWrapper.classList.add('card-title', 'd-flex', 'justify-content-between');
            headerWrapper.appendChild(description);

            description.classList.add('pt-1', 'px-1');
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
                    grid_cell.classList.add('col-1', 'map-cell', 'obstacle', 'px-1');
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