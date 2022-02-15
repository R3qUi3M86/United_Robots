from util.maps_data import maps_data
import database_manager
import numpy


def add_all_maps_to_database():
    for map_data in maps_data:
        database_manager.add_map_to_db(str(map_data))


def convert_map_string_to_array(map_string):
    return eval(map_string)
