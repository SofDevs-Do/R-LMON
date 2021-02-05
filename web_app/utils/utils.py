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


    def get_average_ram_cpu_data(self, from_date, to_date, dictionary):
        data_list = []
        _from_date = datetime.date(*map(lambda x: int(x), from_date.split('-')))
        _to_date = datetime.date(*map(lambda x: int(x), to_date.split('-')))
        iter_date = _from_date

        while iter_date < _to_date + datetime.timedelta(1):
            date_string = str(iter_date)
            if str(iter_date) in dictionary:
                data_list.append(dictionary[str(iter_date)])
            iter_date += datetime.timedelta(1)

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

                        data_dictionary = list(self.mach_col.find({"_id": machine_id},
                                                                  {"_id": 0, color_coding_selector: 1}))[0][color_coding_selector]

                        avg_value = self.get_average_ram_cpu_data(from_date, to_date, data_dictionary)


                        data[room]["rack_list"][rack]["machine_list"][machine_pos]["value"] = avg_value

        return data
