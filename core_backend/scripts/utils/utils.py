import os
import yaml
import pymongo

from dateutil import parser


class Maintanance:

    def __init__(self):
        self.r_lmon_path = os.path.join(os.environ['HOME'], ".r_lmon")
        url_dict = {"db_url": "127.0.0.1:27017",
                    "core_backend_url": "127.0.0.1:8001"}
        with open(os.path.join(self.r_lmon_path, "serverfile.yaml"), "r") as f:
            url_dict = yaml.safe_load(f)
        self.db_url = "mongodb://" + url_dict["db_url"]
        self.db_client = pymongo.MongoClient(self.db_url)
        self.db = self.db_client["rlmon_db"]
        self.core_backend_url = "http://" + url_dict["core_backend_url"]

        self.mach_col = self.db['mach_col']
        self.room_rack_col = self.db['room_rack_col']
        self.cpu_ram_disk_col = self.db['cpu_ram_disk_col']
        self.misc_data_col = self.db['misc_data_col']


    def __select_key_for_last_login(pair):
        date = pair[1]
        if date == "**Never logged in**":
            return parser.parse("1970-01-01")
        else:
            return parser.parse(date)


    def update_obsolete_logins(self):
        mongo_ret = list(self.mach_col.find())
        all_users = []
        for machine in mongo_ret:
            for user in machine["users_last_login"]:
                all_users.append((user+"@"+machine["_id"], machine["users_last_login"][user]))

        all_users.sort(key=Maintanance.__select_key_for_last_login)
        self.misc_data_col.update_one({"_id": 0}, {"$set": {"recent_last_login_data": all_users}}, upsert=True)
