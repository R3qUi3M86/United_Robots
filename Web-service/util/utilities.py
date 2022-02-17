from util.maps_data import maps_data
import database_manager


def add_all_maps_to_database():
    for key in maps_data:
        database_manager.add_map_to_db(str(maps_data[key]), key)


def convert_map_string_to_array(map_string):
    return eval(map_string)
