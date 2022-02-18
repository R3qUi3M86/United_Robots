export let domManager = {
    addChild(parentIdentifier, childContent) {
        const parent = document.getElementById(parentIdentifier);
        if (parent) {
            parent.appendChild(childContent)
        } else {
            console.error("could not find such html element: " + parentIdentifier);
        }
    },
    addEventListener(elementIdentifier, eventType, eventHandler) {
        const element = document.getElementById(elementIdentifier);
        if (element) {
            element.addEventListener(eventType, eventHandler);
        } else {
            console.error("could not find such html element: " + elementIdentifier);
        }
    },
    purgeContainer(elementIdentifier){
        const element = document.getElementById(elementIdentifier);
        if (element) {
            element.innerHTML = "";
        } else {
            console.error("could not find such html element: " + elementIdentifier);
        }
    },
    removeCurrentStatus(elementIdentifier){
        const element = document.getElementById(elementIdentifier);
        if (element) {
            element.removeChild((element.children[1]));
        } else {
            console.error("could not find such html element: " + elementIdentifier);
        }
    },
    paintMap(elementIdentifier, map){
        const element = document.getElementById(elementIdentifier);
        if (element) {
            const rows = element.children;
            for (let i = 0; i < rows.length; i++){
                const map_row_arr = Array.from(map[i]);
                for (let j = 0; j < rows[i].children.length; j++){
                    if (map_row_arr[j] === 'X'){
                        element.children[i].children[j].classList.add('obstacle')
                    } else {
                        element.children[i].children[j].classList.remove('obstacle')
                    }
                }
            }
        } else {
            console.error("could not find such html element: " + elementIdentifier);
        }
    },
    updateRobotOnMap(elementIdentifier, robotPos, robotLastPos){
        const element = document.getElementById(elementIdentifier);
        if (element) {
            if (robotPos !== robotLastPos){
                if (robotLastPos){
                    element.children[robotLastPos[0]].children[robotLastPos[1]].innerText = ''
                }
                element.children[robotPos[0]].children[robotPos[1]].innerText = 'R'
            }
        } else {
            console.error("could not find such html element: " + elementIdentifier);
        }
    },
    enableButton(elementIdentifier){
        const element = document.getElementById(elementIdentifier);
        if (element) {
            element.classList.remove('disabled');
        } else {
            console.error("could not find such html element: " + elementIdentifier);
        }
    },
    disableButton(elementIdentifier){
        const element = document.getElementById(elementIdentifier);
        if (element) {
            element.classList.add('disabled');
        } else {
            console.error("could not find such html element: " + elementIdentifier);
        }
    },
}