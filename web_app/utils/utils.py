import pymongo
import datetime
import statistics

class Util:

    def __init__(self, db_url):
        self.db_url = db_url
        self.db_client = pymongo.MongoClient(self.db_url)
        self.db = self.db_client["rlmon_db"]

        self.mach_col = self.db['mach_col']
        self.room_rack_col = self.db['room_rack_col']
        self.cpu_ram_col = self.db['cpu_ram_col']


    def get_average_ram_cpu_data(self, what_data, machine_id, from_date, to_date):
        query_request_dict = dict()
        data_list = []
        _from_date = datetime.date(*map(lambda x: int(x), from_date.split('-')))
        _to_date = datetime.date(*map(lambda x: int(x), to_date.split('-')))
        iter_date = _from_date

        while iter_date < _to_date + datetime.timedelta(1):
            query_request_dict[what_data+"." + str(iter_date)] = 1
            iter_date += datetime.timedelta(1)

        query_request_dict["_id"] = 0
        mongo_ret = self.cpu_ram_col.find({"_id": machine_id}, query_request_dict)

        for ret_val in mongo_ret:
            data_list = list(list(ret_val[what_data].values()))

        if (len(data_list) > 0):
            return statistics.mean(data_list)
        return 0


    def get_overview_page_cpu_ram_data(self, color_coding_selector, from_date, to_date):
        data = dict()
        mongo_ret = self.room_rack_col.find({}, {"_id":0})
        for data in mongo_ret:
            for room in data:
                for rack in data[room]["rack_list"]:
                    for machine_pos in data[room]["rack_list"][rack]["machine_list"]:
                        machine_id = data[room]["rack_list"][rack]["machine_list"][machine_pos]["_id"]
                        avg_value = self.get_average_ram_cpu_data(color_coding_selector, machine_id, from_date, to_date)
                        data[room]["rack_list"][rack]["machine_list"][machine_pos]["value"] = avg_value
        return data


    def get_machine_avg_cpu_ram_data(self, what_data, machine_id, from_date, to_date):
        avg_value = self.get_average_ram_cpu_data(what_data, machine_id, from_date, to_date)
        return "{0:.2f}%".format(avg_value)


    def get_machine_data(self, machine_id):
        return list(self.mach_col.find({"_id": machine_id}))[0]
