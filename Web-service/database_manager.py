import database_common
from psycopg2.extras import RealDictCursor, RealDictRow
from util import maps_data


robotsDirectStatus = {}
robotsRoutedStatus = {}
maps_data_in_use_by_robots = {}


def get_robot_status(robot_id):
    robot_status = {'internet_conn': False, 'operator_conn': False, 'activity': 'unknown', 'position': 'unknown'}
    if robot_id in robotsDirectStatus and robot_id in robotsRoutedStatus:
        if robotsDirectStatus[robot_id]['timestamp'] > robotsRoutedStatus[robot_id]['timestamp']:
            robot_status = robotsDirectStatus[robot_id]
        else:
            robot_status = robotsRoutedStatus[robot_id]
    elif robot_id in robotsDirectStatus:
        robot_status = robotsDirectStatus[robot_id]
    elif robot_id in robotsRoutedStatus:
        robot_status = robotsRoutedStatus[robot_id]

    if 'used_map_id' in robot_status and robot_status['used_map_id']:
        if robot_status['used_map_id'] in maps_data_in_use_by_robots:
            robot_status['used_map'] = maps_data_in_use_by_robots[robot_status['used_map_id']]
        else:
            map_data = get_map(robot_status['used_map_id'])
            if map_data:
                robot_status['used_map'] = map_data

    return robot_status


@database_common.connection_handler
def get_user_name(cursor: RealDictCursor, u_id) -> RealDictRow:
    query = """
        SELECT user_name
        FROM users
        WHERE id = %(u_id)s
        """
    cursor.execute(query, {"u_id": u_id})
    return cursor.fetchone()['user_name']


@database_common.connection_handler
def get_robots(cursor: RealDictCursor, u_id) -> list:
    query = """
        SELECT id, robot_sn, robot_name
        FROM robots
        WHERE owner_id = %(u_id)s
        """
    cursor.execute(query, {"u_id": u_id})
    return cursor.fetchall()


@database_common.connection_handler
def get_map(cursor: RealDictCursor, map_id) -> list:
    query = """
        SELECT map_data
        FROM maps
        WHERE id = %(map_id)s
        """
    cursor.execute(query, {"map_id": map_id})
    return cursor.fetchone()


@database_common.connection_handler
def add_map_to_db(cursor: RealDictCursor, map_data, map_id):
    query = """
        INSERT INTO maps (id, map_data)
        VALUES (%(map_id)s, %(map_data)s)
    """
    cursor.execute(query, {'map_id': map_id, 'map_data': map_data})
