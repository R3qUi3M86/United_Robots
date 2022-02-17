import time
import threading

robot_sn = {1: "SN-001", 2: "SN-002", 3: "SN-003"}
robot_name = {1: "Mr-Handy-MK1", 2: "Terminator-T800", 3: "Annihilator-3000"}

# Commands
POWER_ON = 'power_on'
POWER_OFF = 'power_off'
DOWNLOAD = 'download'
UPLOAD = 'upload'
SET_MAP = 'set_map'
DO = 'do'
MOVE = 'move'
SELF_DESTRUCT = 'self_destruct'

# Movement constants
MOVE_UP = "U"
MOVE_DOWN = "D"
MOVE_LEFT = "L"
MOVE_RIGHT = "R"
MOVE_GRID = "G"

# Activities
POWERED_DOWN = 'powered down'
STARTING_UP = 'powering up'
SHUTTING_DOWN = 'shutting down'
IDLE = 'idle'
MOVING = 'moving'
DOWNLOADING_DATA = 'downloading map data from web service'
UPLOADING_DATA = 'uploading map data to web service'

DOING_STUFF = "Doing robot stuff..."
CLEANING = 'cleaning'
PROTECTING = 'protecting John Connor'
SHOOTING = 'emitting omnidirectional antimatter sphere'

# Log reports
LOG_MOVE_U = "moving north"
LOG_MOVE_D = "moving south"
LOG_MOVE_R = "moving east"
LOG_MOVE_L = "moving west"
TRAVELING = "Traveling to designated location..."
ARRIVED = "Arrived at destination!"
STOPPED = "Stopped due to lost connection"

PWR_1a = "Initializing primary power circuits..."
PWR_2a = "Starting secondary modules..."
PWR_3a = "Internal systems checking..."
PWR_4a = "Startup sequence finished!"

PWR_1b = "Starting internal diagnostic sub-routine..."
PWR_2b = "Finding problem..."
PWR_3b = "Initializing backup power..."
PWR_4b = "Unit operational at emergency power!"

PWR_1c = "Reactor - online!"
PWR_2c = "Sensors - online!"
PWR_3c = "Weapons - online!"
PWR_4c = "All systems - nominal!"

PWR_SEQUENCE_1 = [PWR_1a, PWR_2a, PWR_3a, PWR_4a]
PWR_SEQUENCE_2 = [PWR_1b, PWR_2b, PWR_3b, PWR_4b]
PWR_SEQUENCE_3 = [PWR_1c, PWR_2c, PWR_3c, PWR_4c]

SHUTDWN = "Shutting down..."


class Robot:
    def __init__(self, robot_id):
        self.robot_id = robot_id
        self.name = robot_name[robot_id]
        self.serial_no = robot_sn[robot_id]
        self.activity = POWERED_DOWN
        self.position = [1, 1]
        self.used_map = None
        self.doing_stuff = DOING_STUFF
        self.log_report = None
        self.operator_connection = False
        self.internet_connection = False
        self.has_started = False
        self.is_destroyed = False

        self.pwr_up_seq = PWR_SEQUENCE_1

        self.maps = {}

    # Taking commands
    def take_command(self, command_data):
        if command_data['command_type'] == POWER_ON:
            self.start_robot()
        elif command_data['command_type'] == POWER_OFF:
            self.shutdown_robot()
        elif command_data['command_type'] == DOWNLOAD:
            self.download_map_data(command_data['map_id'], command_data['map_data'])
        elif command_data['command_type'] == UPLOAD:
            self.upload_map_data(command_data['map_id'])
        elif command_data['command_type'] == SET_MAP:
            self.set_used_map(command_data['map_id'])
        elif command_data['command_type'] == DO:
            self.do_robot_stuff()
        elif command_data['command_type'] == MOVE:
            if command_data['move_dir'] == MOVE_GRID:
                self.travel_to_grid_loc(command_data['grid'])
            else:
                self.move_robot(command_data['move_dir'])
        elif command_data['command_type'] == SELF_DESTRUCT:
            self.destroy_robot()

    # Connection status setting
    def set_connections_status(self, json):
        if 'internet_conn' in json:
            self.internet_connection = json['internet_conn']
        elif 'operator_conn' in json:
            self.operator_connection = json['operator_conn']

    # Movement
    def move_robot(self, direction):
        self.activity = MOVING
        if direction == MOVE_UP:
            self.log_report = LOG_MOVE_U
            time.sleep(1)
            self.move_up()
        elif direction == MOVE_DOWN:
            self.log_report = LOG_MOVE_D
            time.sleep(1)
            self.move_down()
        elif direction == MOVE_LEFT:
            self.log_report = LOG_MOVE_L
            time.sleep(1)
            self.move_left()
        elif direction == MOVE_RIGHT:
            self.log_report = LOG_MOVE_R
            time.sleep(1)
            self.move_right()
        time.sleep(1)
        self.activity = IDLE
        self.log_report = None

    def move_up(self):
        self.position[0] = self.position[0] - 1

    def move_down(self):
        self.position[0] = self.position[0] + 1

    def move_left(self):
        self.position[1] = self.position[1] - 1

    def move_right(self):
        self.position[1] = self.position[1] + 1

    def travel_to_grid_loc(self, grid_row_col):
        self.activity = MOVING
        self.log_report = TRAVELING
        time.sleep(1)
        pass
        self.activity = IDLE
        self.log_report = ARRIVED

    # Doing other stuff
    def do_robot_stuff(self):
        self.activity = self.doing_stuff
        self.log_report = DOING_STUFF

    def start_robot(self):
        self.activity = STARTING_UP
        for log in self.pwr_up_seq:
            self.log_report = log
            time.sleep(2)
        self.has_started = True
        self.activity = IDLE

    def shutdown_robot(self):
        self.activity = SHUTTING_DOWN
        self.log_report = SHUTDWN
        self.has_started = False
        time.sleep(2)
        self.activity = POWERED_DOWN

    def download_map_data(self, map_id, map_data):
        self.activity = DOWNLOADING_DATA + f" [Map ID: {map_id}]"
        time.sleep(2)
        self.maps[map_id] = map_data
        self.activity = IDLE

    def upload_map_data(self, map_id):
        self.activity = UPLOADING_DATA + f" [Map ID: {map_id}]"
        time.sleep(2)
        self.activity = IDLE

    def set_used_map(self, map_id):
        self.used_map = self.maps[map_id]

    def destroy_robot(self):
        self.activity = POWERED_DOWN
        self.is_destroyed = True
        self.has_started = False
        self.operator_connection = False
        self.internet_connection = False


class Cleaner(Robot):
    def __init__(self, robot_id):
        super().__init__(robot_id)
        self.doing_stuff = CLEANING


class Terminator(Robot):
    def __init__(self, robot_id):
        super().__init__(robot_id)
        self.doing_stuff = PROTECTING

    def destroy_robot(self):
        self.activity = POWERED_DOWN
        self.is_destroyed = True
        self.has_started = False
        self.pwr_up_seq = PWR_SEQUENCE_2
        self.operator_connection = False
        self.internet_connection = False
        time.sleep(5)
        self.is_destroyed = False
        self.start_robot()
        self.do_robot_stuff()


class Annihilator(Robot):
    def __init__(self, robot_id):
        super().__init__(robot_id)
        self.doing_stuff = SHOOTING
        self.pwr_up_seq = PWR_SEQUENCE_3
