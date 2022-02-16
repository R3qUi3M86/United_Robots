import database_common
from psycopg2.extras import RealDictCursor, RealDictRow
from util import maps_data


robotsDirectStatus = {1: {'activity': 'cleaning', 'position': (1, 1), 'map': maps_data.maps_data[1]}}
robotsRoutedStatus = {1: {'activity': 'cleaning', 'position': (1, 1), 'map': maps_data.maps_data[1]}}


def get_robot_status(robot_id):
    robot_status = {'activity': 'unknown', 'position': 'unknown'}
    if robot_id in robotsDirectStatus:
        conn_status = {'internet connection': 'UP'}
        robot_status = robotsDirectStatus[robot_id]
    else:
        conn_status = {'internet connection': 'DOWN'}

    if robot_id in robotsRoutedStatus:
        conn_status['operator connection'] = 'UP'
        robot_status = robotsRoutedStatus[robot_id]
    else:
        conn_status['operator connection'] = 'DOWN'

    return {'conn_status': conn_status, 'robot_data': robot_status}


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
def add_map_to_db(cursor: RealDictCursor, map_data):
    query = """
        INSERT INTO maps (map_data)
        VALUES (%(map_data)s)
    """

    cursor.execute(query, {'map_data': map_data})
