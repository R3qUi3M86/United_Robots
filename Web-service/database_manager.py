import database_common
from psycopg2.extras import RealDictCursor, RealDictRow
from util import maps_data


robotsDirectStatus = {}
robotsRoutedStatus = {}


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

    return robot_status


@database_common.connection_handler
def get_user_name(cursor: RealDictCursor, u_id) -> RealDictRow:
    query = """
        SELECT user_name
        FROM users
        WHERE user_id = %(u_id)s
        """
    cursor.execute(query, {"u_id": u_id})
    return cursor.fetchone()['user_name']


@database_common.connection_handler
def get_robots(cursor: RealDictCursor, u_id) -> list:
    query = """
        SELECT robot_id, robot_sn, robot_name
        FROM robots
        WHERE owner_id = %(u_id)s
        """
    cursor.execute(query, {"u_id": u_id})
    return cursor.fetchall()


@database_common.connection_handler
def get_map(cursor: RealDictCursor, map_id) -> dict:
    query = """
        SELECT map_id, map_data
        FROM maps
        WHERE map_id = %(map_id)s
        """
    cursor.execute(query, {"map_id": map_id})
    db_data = cursor.fetchone()
    return {'map_id': db_data['map_id'], 'map': eval(db_data['map_data'])}


@database_common.connection_handler
def get_maps(cursor: RealDictCursor) -> list:
    query = """
        SELECT map_id
        FROM maps
        """
    cursor.execute(query)
    db_rows = cursor.fetchall()
    map_ids = []
    for row in db_rows:
        map_ids.append(row['map_id'])

    return map_ids


@database_common.connection_handler
def add_map_to_db(cursor: RealDictCursor, map_data, map_id):
    query = """
        INSERT INTO maps (map_id, map_data)
        VALUES (%(map_id)s, %(map_data)s)
    """
    cursor.execute(query, {'map_id': map_id, 'map_data': map_data})
