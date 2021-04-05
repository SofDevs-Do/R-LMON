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
            if what_data in ret_val:
                data_list = list(list(ret_val[what_data].values()))

        if (len(data_list) > 0):
            return (sum(data_list)/i)
        return -1

    def get_ram_cpu_data(self, what_data, machine_id, from_date, to_date):
        query_request_dict = dict()
        data_dict = dict()
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
        ret_val = {"cpu_util": dict(), "ram_util": dict()}
        db_ret = self.cpu_ram_disk_col.find({"_id": machine_id}, query_request_dict)
        for data in db_ret:
            ret_val = data
            break

        j = 0
        for j in date_list:
            if j not in ret_val[what_data]:
                for i in range(24):
                    data_dict[j+" "+"{:02d}".format(i)] = 0
            else:
                for i in range(24):
                    data_dict[j+" "+"{:02d}".format(i)] = ret_val[what_data][j][i]

        return data_dict


    def get_last_login_data(self, machine_id):
        mongo_ret = self.mach_col.find({"_id": machine_id}, {"_id":0, "users_last_login":1})
        for data in mongo_ret:
            return data
        return {"users_last_login": dict()}

    def get_most_recent_last_login_data(self, machine_id):
        last_login_dict = self.get_last_login_data(machine_id)
        login_dates = sorted(last_login_dict["users_last_login"].items(),
                             key=lambda pair: parser.parse(pair[1]),
                             reverse=True)
        for last_login_date in login_dates:
            return parser.parse(last_login_date[1]).strftime("%Y-%m-%d")

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
                        ret_data = self.get_machine_data(machine_id)
                        data[room]["rack_list"][rack]["machine_list"][machine_pos]["assigned_to"] = ret_data['assigned_to']
                        data[room]["rack_list"][rack]["machine_list"][machine_pos]["student_assigned_to"] = ret_data['student_assigned_to']
                        data[room]["rack_list"][rack]["machine_list"][machine_pos]["ip_addr"] = ret_data['address'].split("@")[-1]
        return data


    def get_machine_data(self, machine_id):
        ret_data = {'_id': machine_id,
                    'swap_info': 'no data',
                    'assigned_to': 'no data',
                    'student_assigned_to': 'no data',
                    'users_last_login': dict(),
                    'comments': 'no data',
                    'cpu_model': 'no data',
                    'hostname': 'no data',
                    'ram_capacity': 'no data',
                    'os_info': 'no data',
                    'address': 'no data',
                    'disk_info': dict(),
                    'ip_info': dict(),
                    'uptime': 'no data'}
        for data in self.mach_col.find({"_id": machine_id}):
            for field in data:
                if field in ret_data:
                    ret_data[field] = data[field]
            break

        return ret_data


    def get_average_disk_data(self, machine_id, from_date, to_date):
        _from_date = datetime.date(*map(lambda x: int(x), from_date.split('-')))
        _to_date = datetime.date(*map(lambda x: int(x), to_date.split('-')))
        iter_date = _from_date
        i = 0

        mach_disk_info = dict()
        db_ret = self.mach_col.find({"_id": machine_id})
        for data in db_ret:
            if 'disk_info' in data:
                mach_disk_info = data['disk_info']
            break

        used_disk_date_wise_info = dict()
        db_ret = self.cpu_ram_disk_col.find({"_id": machine_id})
        for data in db_ret:
            if 'disk_info' in data:
                used_disk_date_wise_info = data['disk_info']
            break

        fs_list = mach_disk_info.keys()
        
        for each_fs in fs_list:
            used_GB_sum = 0
            days_count = 0
            iter_date = _from_date
            while iter_date < _to_date + datetime.timedelta(1):
                if str(iter_date) in used_disk_date_wise_info[each_fs]['used_GB'].keys():
                    used_GB_sum += float(used_disk_date_wise_info[each_fs]['used_GB'][str(iter_date)])
                    days_count += 1
                iter_date += datetime.timedelta(1)
            if days_count != 0:
                used_GB_avg = used_GB_sum / days_count
            else:
                used_GB_avg = -1  #no log found for that date, yet to be handled
            mach_disk_info[each_fs]['avg_used_GB'] = used_GB_avg
        return mach_disk_info

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
