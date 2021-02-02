import os
import errno
from utils.rlmon_db import RLMON_DB

class Util:

    hours_list = list(range(24))
    rlmon_path = os.path.join(os.environ.get('HOME'), ".r_lmon")
    log_dir = os.path.join(rlmon_path, "core_backend", "_log")

    def __init__(self):
        # Check if the static data members are correct.
        if (not os.path.isdir(Util.rlmon_path)):
            raise FileNotFoundError(errno.ENOENT, os.strerror(errno.ENOENT), Util.rlmon_path)

        if (not os.path.isdir(Util.log_dir)):
            raise FileNotFoundError(errno.ENOENT, os.strerror(errno.ENOENT), Util.log_dir)

        self.db = RLMON_DB(Util.rlmon_path, Util.log_dir)


    def get_overview_data(self, start_date, end_date):
        """
        Returns the overview data.
        {
            'room_id':
                 {
                     'room_name': <string:name>,
                     'rack_list':
                         {
                             'rack_id':
                                   {
                                       'rack_name': <string:name>,
                                       'machines_list': ['machine_id_1', 'machine_id_2', ...]
                                   },
                              ...
                         },
                     ...
                 },
            ...
        }
        """
        rooms_dict = self.db.get_rooms(start_date)

        for room in rooms_dict:
            rooms_dict[room]['rack_list'] = self.db.get_racks_in_room(start_date, room)

        return rooms_dict
