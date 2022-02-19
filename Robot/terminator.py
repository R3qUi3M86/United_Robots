import robot_api
from robots import Terminator

robot_api.ROBOT_ID = 2
robot_api.robot = Terminator(robot_api.ROBOT_ID)

robot_api.main()
