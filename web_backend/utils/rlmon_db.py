# Currently there is no DB that is being used.
# use of DB is bypassed and raw files are used for
# storage and reading the data. However, the data
# format used is such that it will facilitate the use of
# a DB in the future.

class RLMON_DB:

    def __init__(self, rlmon_path, log_dir):
        self.rlmon_path = rlmon_path
        self.log_dir = log_dir


    def get_rooms(self, date):
        """
        Returns all the rooms that are present on the given day.
        {
            'room_id':
                 {
                     'room_name': <string:name>,
                     'rack_list': ['rack_id_1', 'rack_id_2', ...],
                 },
             ...
        }
        """
        return dict()


    def get_racks_in_room(self, date, sruid):
        """
        Returns all the racks in a given room. On a given day.
        {
            'rack_id':
                 {
                     'rack_name'    : <string:name>,
                     'machine_list' : ['machine_id_1', 'machine_id_2', ...]
                 },
            ...
        }
        """
        return dict()
