from pathfinding.core.diagonal_movement import DiagonalMovement
from pathfinding.core.grid import Grid
from pathfinding.finder.a_star import AStarFinder


def generate_matrix(used_map):
    matrix = []
    for row in used_map:
        matrix_row = []
        for cell in row:
            if cell == " ":
                matrix_row.append(1)
            else:
                matrix_row.append(0)
        matrix.append(matrix_row)

    return matrix


class Pathfinder:
    def __init__(self):
        self.robot_index = None
        self.destination = None
        self.matrix = None
        self.finder = AStarFinder(diagonal_movement=DiagonalMovement.always)
        self.path = []
    
    def create_path(self):
        grid = Grid(matrix=self.matrix)
        start_grid = grid.node(self.robot_index[1], self.robot_index[0])
        end_grid = grid.node(self.destination[1], self.destination[0])

        self.path, _ = self.finder.find_path(start_grid, end_grid, grid)
        print(grid.grid_str(self.path, start_grid, end_grid))

    def update(self, used_map, robot_index, destination):
        self.matrix = generate_matrix(used_map)
        self.robot_index = robot_index
        self.destination = destination

