from util import maps_data


robotsDirectStatus = {}
robotsWebStatus = {}
maps_id_in_use_by_robots = {}


def get_connected_robots():
    web_connected_robot_ids = set(robotsDirectStatus.keys())
    op_connected_robot_ids = set(robotsWebStatus.keys())
    web_connected_robot_ids.update(op_connected_robot_ids)
    all_connected_robot_ids = web_connected_robot_ids

    connected_robot_list = []
    for robot_id in all_connected_robot_ids:
        robot_status = get_robot_status(robot_id)
        robot = {'robot_id': robot_id, 'robot_name': robot_status['robot_name'], 'robot_sn': robot_status['robot_sn']}
        connected_robot_list.append(robot)
    return connected_robot_list


def get_robot_status(robot_id):
    robot_status = {'internet_conn': False, 'operator_conn': False, 'activity': 'unknown', 'position': 'unknown'}
    if robot_id in robotsDirectStatus and robot_id in robotsWebStatus:
        if robotsDirectStatus[robot_id]['timestamp'] > robotsWebStatus[robot_id]['timestamp']:
            robot_status = robotsDirectStatus[robot_id]
        else:
            robot_status = robotsWebStatus[robot_id]
    elif robot_id in robotsDirectStatus:
        robot_status = robotsDirectStatus[robot_id]
    elif robot_id in robotsWebStatus:
        robot_status = robotsWebStatus[robot_id]

    return robot_status
