from flask import Flask, render_template, url_for, request, redirect, session, jsonify
from flask_socketio import SocketIO, emit
from engineio.payload import Payload
from dotenv import load_dotenv
from util import utilities
from util import maps_data
from time import time
import database_manager
import bcrypt
from copy import deepcopy

app = Flask(__name__)
app.secret_key = "super duper hyper turbo and very salty secret key!"
socket = SocketIO(app, cors_allowed_origins='*')
load_dotenv()

# utilities.add_all_maps_to_database()

operator_socket = None

@app.route("/")
def index():
    session['uid'] = 1  # login placeholder
    logged = True if 'uid' in session else False
    user_name = database_manager.get_user_name(session['uid'])
    return render_template('index.html', logged=logged, user_name=user_name)


@app.route("/robots")
def get_robots():
    if 'uid' in session:
        return jsonify(database_manager.get_robots(session['uid']))
    else:
        return redirect('/')


@app.route("/robot-status", methods=["POST"])
def get_robot_status():
    robot_id = request.json['robot_id']
    robot_status = database_manager.get_robot_status(int(robot_id))
    return jsonify({'response_status': 'ok', 'robot_status': robot_status})


@app.route("/maps")
def get_maps():
    return jsonify(database_manager.get_maps())


@app.route("/get-map", methods=["POST"])
def get_map():
    map_id = request.json['map_id']
    map_data = database_manager.get_map(map_id)
    return jsonify({'response_status': 'ok', 'map_data': map_data})


@socket.on("connect", namespace='/robot-update')
def connect_robot():
    emit('receive_conn', {'internet_conn': True})


@socket.on("disconnect", namespace='/robot-update')
def disconnect_robot():
    print(database_manager.robotsDirectStatus)
    robot_id = None
    for key in database_manager.robotsDirectStatus:
        if request.sid == database_manager.robotsDirectStatus[key]['conn_sid']:
            robot_id = key
            break
    del database_manager.robotsDirectStatus[robot_id]
    if operator_socket:
        data = {'robot_id': robot_id, 'status': 'web_lost_connection'}
        emit('receive_update', data, namespace='/operator-update', room=operator_socket)


@socket.on("update_status", namespace='/robot-update')
def receive_robot_status_update_from_robot(data):
    database_manager.robotsDirectStatus[data['robot_id']] = {'robot_name': data['robot_name'],
                                                             'robot_sn': data['robot_sn'],
                                                             'internet_conn': data['internet_conn'],
                                                             'operator_conn': data['operator_conn'],
                                                             'activity': data['activity'],
                                                             'position': data['position'],
                                                             'used_map_id': data['used_map_id'],
                                                             'conn_sid': request.sid,
                                                             'timestamp': time()}

    if operator_socket:
        exchange_data = deepcopy(data)
        exchange_data['timestamp'] = time()
        emit('receive_update', exchange_data, namespace='/operator-update',
             room=operator_socket)


@socket.on("map_upload", namespace='/robot-update')
def download_robot_map(map_data):
    database_manager.add_map_to_db(map_data)


@socket.on("connect", namespace='/operator-update')
def connect_operator():
    global operator_socket
    operator_socket = request.sid
    emit('receive_conn', {'internet_conn': True})


@socket.on("disconnect", namespace='/operator-update')
def disconnect_operator():
    global operator_socket
    print(database_manager.robotsRoutedStatus)
    robot_id = None
    for key in database_manager.robotsRoutedStatus:
        if request.sid == database_manager.robotsRoutedStatus[key]['conn_sid']:
            robot_id = key
            break
    if robot_id:
        del database_manager.robotsRoutedStatus[robot_id]
    operator_socket = None


@socket.on("update_status", namespace='/operator-update')
def receive_robot_status_update_from_op(data):
    if 'status' in data and data['status'] == 'operator_lost_connection':
        if data['robot_id'] in database_manager.robotsRoutedStatus:
            del database_manager.robotsRoutedStatus[data['robot_id']]
    else:
        database_manager.robotsRoutedStatus[data['robot_id']] = {'robot_name': data['robot_name'],
                                                                 'robot_sn': data['robot_sn'],
                                                                 'internet_conn': data['internet_conn'],
                                                                 'operator_conn': data['operator_conn'],
                                                                 'activity': data['activity'],
                                                                 'position': data['position'],
                                                                 'used_map_id': data['used_map_id'],
                                                                 'conn_sid': request.sid,
                                                                 'timestamp': time()}


def main():
    app.run(debug=True, port=5000)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
