import random
import pymongo

class Util:

    def __init__(self, db_url):
        self.db_url = db_url
        self.db_client = pymongo.MongoClient(self.db_url)
        self.db = self.db_client["rlmon_db"]

        self.mach_col = self.db['mach_col']
        self.room_rack_col = self.db['room_rack_col']


    def get_overview_page_data(self, color_coding_selector, from_date, to_date):
        data = dict()
        mongo_ret = self.room_rack_col.find({}, {"_id":0})
        for data in mongo_ret:
            for room in data:
                for rack in data[room]["rack_list"]:
                    for machine_pos in data[room]["rack_list"][rack]["machine_list"]:
                        machine_id = data[room]["rack_list"][rack]["machine_list"][machine_pos]["_id"]

                        date = "2021-02-04"
                        mac_data = list(self.mach_col.find({"_id": machine_id}, {"_id": 0, "avg_cpu_util": 1}))[0]['avg_cpu_util']
                        if (date in mac_data):
                            data[room]["rack_list"][rack]["machine_list"][machine_pos]["value"] = mac_data[date]
                        else:
                            data[room]["rack_list"][rack]["machine_list"][machine_pos]["value"] = -1

        return data
