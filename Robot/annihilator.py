import robot_api
from robots import Annihilator

robot_api.ROBOT_ID = 3
robot_api.robot = Annihilator(robot_api.ROBOT_ID)

robot_api.main()
