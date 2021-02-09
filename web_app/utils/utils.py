import os
import pymongo
import datetime
import statistics

from dateutil import parser

class Util:

    def __init__(self, db_url):
        self.db_url = db_url
        self.db_client = pymongo.MongoClient(self.db_url)
        self.db = self.db_client["rlmon_db"]

        self.mach_col = self.db['mach_col']
        self.room_rack_col = self.db['room_rack_col']
        self.cpu_ram_disk_col = self.db['cpu_ram_disk_col']


    def get_average_ram_cpu_data(self, what_data, machine_id, from_date, to_date):
        query_request_dict = dict()
        data_list = []
        _from_date = datetime.date(*map(lambda x: int(x), from_date.split('-')))
        _to_date = datetime.date(*map(lambda x: int(x), to_date.split('-')))
        iter_date = _from_date
        i = 0

        while iter_date < _to_date + datetime.timedelta(1):
            query_request_dict[what_data+"." + str(iter_date)] = 1
            iter_date += datetime.timedelta(1)
            i += 1

        query_request_dict["_id"] = 0
        mongo_ret = self.cpu_ram_disk_col.find({"_id": machine_id}, query_request_dict)

        for ret_val in mongo_ret:
            data_list = list(list(ret_val[what_data].values()))

        if (len(data_list) > 0):
            return (sum(data_list)/i)
        return -1

    def get_ram_cpu_data(self, what_data, machine_id, from_date, to_date):
        query_request_dict = dict()
        data_list = []
        date_list = []
        _from_date = datetime.date(*map(lambda x: int(x), from_date.split('-')))
        _to_date = datetime.date(*map(lambda x: int(x), to_date.split('-')))
        iter_date = _from_date
        i = 0

        while iter_date < _to_date + datetime.timedelta(1):
            query_request_dict[what_data+"." + str(iter_date)] = 1
            date_list.append(str(iter_date))
            iter_date += datetime.timedelta(1)
            i += 1

        query_request_dict["_id"] = 0
        ret_val = list(self.cpu_ram_disk_col.find({"_id": machine_id}, query_request_dict))[0]

        j = 0
        for j in date_list:
            if j not in ret_val[what_data]:
                data_list.extend([0]*24)
            else:
                data_list.extend(ret_val[what_data][j])

        print(data_list)
        return data_list


    def get_last_login_data(self, machine_id):
        mongo_ret = list(self.mach_col.find({"_id": machine_id}, {"_id":0, "users_last_login":1}))[0]
        return mongo_ret

    def get_most_recent_last_login_data(self, machine_id):
        last_login_dict = self.get_last_login_data(machine_id)
        login_dates = sorted(last_login_dict["users_last_login"].items(),
                             key=lambda pair: parser.parse(pair[1]),
                             reverse=True)
        return parser.parse(login_dates[0][1]).strftime("%Y-%m-%d")

    def get_overview_page_data(self, color_coding_selector, from_date, to_date):
        data = dict()
        mongo_ret = self.room_rack_col.find({}, {"_id":0})
        for data in mongo_ret:
            for room in data:
                for rack in data[room]["rack_list"]:
                    for machine_pos in data[room]["rack_list"][rack]["machine_list"]:
                        machine_id = data[room]["rack_list"][rack]["machine_list"][machine_pos]["_id"]
                        value = -1
                        if (color_coding_selector == 'avg_cpu_util' or color_coding_selector == 'avg_ram_util'):
                            value = self.get_average_ram_cpu_data(color_coding_selector, machine_id, from_date, to_date)
                        elif (color_coding_selector == 'users_last_login'):
                            value = self.get_most_recent_last_login_data(machine_id)
                        data[room]["rack_list"][rack]["machine_list"][machine_pos]["value"] = value
        return data


    def get_machine_data(self, machine_id):
        return list(self.mach_col.find({"_id": machine_id}))[0]


    def machine_ctrl(self, machine_id, operation):
        mongo_ret = self.mach_col.find({"_id": machine_id}, {"_id": 0, "address": 1})
        address = ""
        _operation = ""

        if (operation == "shutdown"):
            _operation = " '/sbin/shutdown 0'"
        elif (operation == "reboot"):
            _operation = " '/sbin/reboot'"

        for ret_val in mongo_ret:
            address = ret_val["address"]

        if (address != "" and _operation != ""):
            response = os.system("ssh " + address + _operation)
            if (response == 0):
                return True

        return False
