from flask import Flask, render_template, url_for, request, redirect, session, jsonify
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
from util import utilities
from util import maps_data
import database_manager
import bcrypt

app = Flask(__name__)
app.secret_key = "super duper hyper turbo and very salty secret key!"
socket = SocketIO(app)
load_dotenv()

user_conn_sockets = {}

# utilities.add_all_maps_to_database()


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
    robot_id = request.json['id']

    robot_status = database_manager.get_robot_status(int(robot_id))

    return jsonify({'response_status': 'ok', 'robot_status': robot_status})


@app.route("/maps")
def get_maps():
    return jsonify(list(maps_data.maps_data.keys()))

# @socket.on("connect", namespace='/status-update')
# def connect_robot():


@socket.on("disconnect", namespace='/status-update')
def disconnect_user():
    pass


@socket.on("update_stream", namespace='/status-update')
def receive_robot_status_update(data):
    if data['entity'] == 'robot':
        database_manager.robotsDirectStatus[data['robot_id']] = {'activity': data['activity'],
                                                                 'position': data['position'],
                                                                 'conn_sid': request.sid}
    elif data['entity'] == 'operator':
        database_manager.robotsRoutedStatus[data['robot_id']] = {'activity': data['activity'],
                                                                 'position': data['position'],
                                                                 'conn_sid': data['operator_conn_sid']}

        user_conn_sockets[session['uid']] = request.sid


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()