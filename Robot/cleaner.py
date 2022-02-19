import robot_api
from robots import Cleaner

robot_api.ROBOT_ID = 1
robot_api.robot = Cleaner(robot_api.ROBOT_ID)

robot_api.main()
