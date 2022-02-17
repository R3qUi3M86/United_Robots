from flask import Flask, render_template, url_for, request, redirect, session, jsonify
from flask_socketio import SocketIO, emit
from robots import Cleaner, Terminator, Annihilator, UPLOAD
import threading


app = Flask(__name__)
app.secret_key = "super duper hyper turbo and very salty secret key!"

self_socket = None
operator_socket = None
web_socket = None

ROBOT_ID = 1
PORT = None

robot = Cleaner(ROBOT_ID)


@app.route('/')
def robot_main_display():
    return render_template('index.html', robot_name=robot.name, robot_sn=robot.serial_no)


@app.route('/get_update')
def get_robot_status():
    return jsonify(get_status_data())


@app.route('/command', methods=['POST'])
def command_robot():
    authorized_operator = True  # Auth placeholder
    if authorized_operator:
        robot_emulator = threading.Thread(target=robot.take_command, args=(request.json,))
        robot_emulator.start()
        if request.json['command'] == UPLOAD:
            return jsonify({'status': 'ok', 'map_data': str(robot.maps[request.json['map_id']]),
                            'internet_conn': robot.internet_connection})
        return jsonify({'status': 'ok'})
    return jsonify({'status': 'access denied'})


@app.route('/connection', methods=['POST'])
def set_connection_status():
    authorized = True  # Auth placeholder
    if authorized:
        robot.set_connections_status(request.json)
        return jsonify({'status': 'ok'})
    return jsonify({'status': 'access denied'})


@app.route('/get-map')
def get_map_from_robot():
    authorized = True  # Auth placeholder
    if authorized:
        return jsonify()
    return jsonify({'status': 'access denied'})


def get_status_data():
    log_report = None
    if robot.log_report:
        log_report = robot.log_report
        robot.log_report = None

    status_data = {'robot_id': robot.robot_id,
                   'internet_conn': robot.internet_connection,
                   'operator_conn': robot.operator_connection,
                   'activity': robot.activity,
                   'position': robot.position,
                   'loaded_maps': list(robot.maps.keys()),
                   'used_map': robot.used_map,
                   'log_report': log_report,
                   'entity': 'robot'}

    return status_data


def set_app_port(robot_id):
    global PORT
    PORT = 5000+robot_id


def main():
    set_app_port(ROBOT_ID)
    app.run(debug=True, port=PORT)
    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
