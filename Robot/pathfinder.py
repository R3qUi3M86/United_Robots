import random
from pathfinding.core.grid import Grid
from pathfinding.finder.a_star import AStarFinder

class Pathfinder:
    def __init__(self, matrix, monster_tile_index):
        
        self.position = 0,0
        self.monster_tile_index = monster_tile_index
        self.matrix = matrix
        self.grid = Grid(matrix = self.matrix)
        self.finder = AStarFinder()
        self.path = []
        self.points = []
    
    def create_path(self):
        start_grid = self.grid.node(self.monster_tile_index[1], self.monster_tile_index[0])
        end_grid = None
        
        if self.matrix[entity_manager.hero.tile_index[0]][entity_manager.hero.tile_index[1]] == 0:
            new_end_tile_index = self.get_alternative_tile()
            end_grid = self.grid.node(new_end_tile_index[1], new_end_tile_index[0])
        else:
            end_grid = self.grid.node(entity_manager.hero.tile_index[1], entity_manager.hero.tile_index[0])
        
        self.path, _ = self.finder.find_path(start_grid, end_grid, self.grid)
        #print(self.grid.grid_str(self.path, start_grid, end_grid))
        self.grid.cleanup()

    def get_alternative_tile(self):
        potential_tile_indices = [(entity_manager.hero.tile_index[0],entity_manager.hero.tile_index[1]-1),
                                  (entity_manager.hero.tile_index[0],entity_manager.hero.tile_index[1]+1),
                                  (entity_manager.hero.tile_index[0]-1,entity_manager.hero.tile_index[1]),
                                  (entity_manager.hero.tile_index[0]+1,entity_manager.hero.tile_index[1])]
        
        fitered_tile_indices = []

        for tile_index in potential_tile_indices:
            if self.matrix[tile_index[0]][tile_index[1]] == 1:
                fitered_tile_indices.append(tile_index)

        return random.choice(fitered_tile_indices)