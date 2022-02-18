from flask import Flask, render_template, url_for, request, redirect, session, jsonify
from flask_socketio import SocketIO, emit
from util import maps_data
from time import time
import data_manager
import bcrypt

app = Flask(__name__)
app.secret_key = "super duper hyper turbo and very salty secret key!"
socket = SocketIO(app, cors_allowed_origins='*')

user_conn_socket = None


@app.route("/")
def index():
    session['uid'] = 1  # login placeholder
    user_name = 'robot abuser'  # user name placeholder
    logged = True if 'uid' in session else False
    return render_template('index.html', logged=logged, user_name=user_name)


@app.route("/robots")
def get_robots():
    if 'uid' in session:
        return jsonify(data_manager.get_connected_robots())
    else:
        return redirect('/')


@app.route("/robot-status", methods=["POST"])
def get_robot_status():
    robot_id = request.json['robot_id']
    robot_status = data_manager.get_robot_status(int(robot_id))
    return jsonify({'response_status': 'ok', 'robot_status': robot_status})


@app.route("/get-map", methods=["POST"])
def get_map():
    map_id = request.json['map_id']
    requested_map = maps_data.maps_data[map_id]
    print(requested_map)
    return jsonify({'response_status': 'ok', 'map': requested_map})


@socket.on("connect", namespace='/robot-update')
def connect_robot():
    emit('receive_conn', {'operator_conn': True})


@socket.on("disconnect", namespace='/robot-update')
def disconnect_robot():
    print(data_manager.robotsDirectStatus)
    robot_id = None
    for key in data_manager.robotsDirectStatus:
        if request.sid == data_manager.robotsDirectStatus[key]['conn_sid']:
            robot_id = key
            break
    data = {'robot_id': robot_id, 'status': 'operator_lost_connection'}
    emit('receive_robot_update', data, room=user_conn_socket, namespace='/operator-update')
    del data_manager.robotsDirectStatus[robot_id]


@socket.on("update_status", namespace='/robot-update')
def receive_robot_status_update_from_robot(data):
    data_manager.robotsDirectStatus[data['robot_id']] = {'robot_name': data['robot_name'],
                                                         'robot_sn': data['robot_sn'],
                                                         'internet_conn': data['internet_conn'],
                                                         'operator_conn': data['operator_conn'],
                                                         'activity': data['activity'],
                                                         'position': data['position'],
                                                         'used_map_id': data['used_map_id'],
                                                         'conn_sid': request.sid,
                                                         'timestamp': time()}
    data['timestamp'] = time()
    emit('receive_robot_update', data, room=user_conn_socket, namespace='/operator-update')
    if not data_manager.robotsDirectStatus[data['robot_id']]['internet_conn']:
        if data['robot_id'] in data_manager.robotsWebStatus:
            del data_manager.robotsWebStatus[data['robot_id']]


@socket.on("connect", namespace='/operator-update')
def connect_operator():
    global user_conn_socket
    user_conn_socket = request.sid


@app.route("/web-update", methods=["POST"])
def receive_robot_status_update_from_web():
    data = request.json
    if 'status' in data:
        if data['status'] == 'web_lost_connection':
            if data['robot_id'] in data_manager.robotsWebStatus:
                del data_manager.robotsWebStatus[data['robot_id']]
        elif data['status'] == 'operator_lost_web_connection':
            data_manager.robotsWebStatus = {}
    else:
        data_manager.robotsWebStatus[data['robot_id']] = data

    return {'status': 'ok'}


def main():
    app.run(debug=True, port=5050)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
