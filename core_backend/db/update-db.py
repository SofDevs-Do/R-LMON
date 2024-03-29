import os
import sys
import pymongo
import glob
import yaml
import warnings
from utils import *

# connecting to Mongo server
r_lmon_path = os.path.join(os.environ['HOME'], ".r_lmon")
url_dict = {"db_url": "127.0.0.1:27017"}
with open(os.path.join(r_lmon_path, "serverfile.yaml"), "r") as f:
    url_dict = yaml.safe_load(f)
db_url = "mongodb://" + url_dict["db_url"]
myclient = pymongo.MongoClient(db_url)

# accessing the rlmon_db
rlmon_db = myclient["rlmon_db"]

# warn if db being created for the first time.
dblist = myclient.list_database_names()
if "rlmon_db" not in dblist:
    warnings.warn('\'rlmon_db\' was not found to exist. Creating it newly.')

# obtaining the list of collections for rlmon_db
col_list = rlmon_db.list_collection_names()

# accessing room_col collection.
room_col = rlmon_db['room_col']

# warn if room_col being created for the first time.
if 'room_col' not in col_list:
    warnings.warn('\'room_col\' collection was not found to exist. Creating it newly.')

# accessing rack_col collection.
rack_col = rlmon_db['rack_col']

# warn if rack_col being created for the first time.
if 'rack_col' not in col_list:
    warnings.warn('\'rack_col\' collection was not found to exist. Creating it newly.')

# accessing mach_col collection.
mach_col = rlmon_db['mach_col']

# warn if mach_col being created for the first time.
if 'mach_col' not in col_list:
    warnings.warn('\'mach_col\' collection was not found to exist. Creating it newly.')

# accessing room_rack_col collection.
room_rack_col = rlmon_db['room_rack_col']

# warn if mach_col being created for the first time.
if 'room_rack_col' not in col_list:
    warnings.warn("'mach_col' collection was not found. Creating it.")

# accessing cpu_ram_disk_col collection.
cpu_ram_disk_col = rlmon_db['cpu_ram_disk_col']

# warn if mach_col being created for the first time.
if 'cpu_ram_disk_col' not in col_list:
    warnings.warn("'cpu_ram_disk_col' collection was not found. Creating it.")


# accessing the path of data collection log for present day.
log_path = os.path.join(sys.argv[1], "core_backend", "_log", sys.argv[2])

# obtaining the present date from path
today_date = os.path.basename(log_path)

# resolving names of the keys
machine_id_key = "_id"
hostname_key = "hostname"
ip_info_key = "ip_info"
os_info_key = "os_info"
cpu_model_key = "cpu_model"
ram_capacity_key = "ram_capacity"
swap_info_key = "swap_info"
uptime_key = "uptime"
users_last_login_key = "users_last_login"
avg_cpu_util_key = "avg_cpu_util"
avg_ram_util_key = "avg_ram_util"
cpu_util_key = "cpu_util"
ram_util_key = "ram_util"
disk_info_key = "disk_info"
address_key = "address"

# obtaining all the machine_id's for which the data was collected
# machine_id_list = list(map(int,[ os.path.basename(each_path) for each_path in glob.glob(os.path.join(log_path,'*'))]))
machine_id_list = [ os.path.basename(each_path) for each_path in glob.glob(os.path.join(log_path,'*'))]

# updating db for each machine_id
for machine_id in machine_id_list:
    # retrieve present values from the db
    data_dict = list(mach_col.find({machine_id_key : machine_id}))
    cpu_ram_disk_dict = list(cpu_ram_disk_col.find({machine_id_key : machine_id}))

    if len(data_dict) == 0:
        data_dict = dict()
    else:
        data_dict = data_dict[0]

    if len(cpu_ram_disk_dict) == 0:
        cpu_ram_disk_dict = dict()
    else:
        cpu_ram_disk_dict = cpu_ram_disk_dict[0]

    if (not check_if_machine_data_collected(log_path, machine_id)):
        warnings.warn("Data not collected from {}".format(machine_id))
        continue

    # obtain address from data-collected and alter in data_dict
    address = get_address(log_path, machine_id)
    data_dict[address_key] = address

    # obtain hostname from data-collected and alter in data_dict
    hostname = get_hostname(log_path, machine_id)
    data_dict[hostname_key] = hostname

    # obtain ip-info from data-collected and alter in data_dict
    ip_info = get_ip_info(log_path, machine_id)
    data_dict[ip_info_key] = ip_info

    # obtain os-info from data-collected and alter in data_dict
    os_info = get_os_info(log_path, machine_id)
    data_dict[os_info_key] = os_info

    # obtain cpu-model from data-collected and alter in data_dict
    cpu_model = get_cpu_model(log_path, machine_id)
    data_dict[cpu_model_key] = cpu_model

    # obtain ram_capacity from data-collected and alter in data_dict
    ram_capacity = get_ram_capacity(log_path, machine_id)
    data_dict[ram_capacity_key] = ram_capacity

    # obtain swap_info from data-collected and alter in data_dict
    swap_info = get_swap_info(log_path, machine_id)
    data_dict[swap_info_key] = swap_info

    # obtain uptime from data-collected and alter in data_dict
    uptime = get_uptime_info(log_path, machine_id)
    data_dict[uptime_key] = uptime

    # obtain users_last_login from data-collected and alter in data_dict
    users_last_login = get_users_last_login(log_path, machine_id)
    data_dict[users_last_login_key] = users_last_login

    # misc information such as assigned to whom, and other comments.
    # check if these data are present in the DB already, if not, then add
    # No Data in their place, otherwise, read from the DB and use it
    # to populate the fields

    for machine in mach_col.find({"_id": machine_id}):
        if ("assigned_to" in machine):
            data_dict["assigned_to"] = machine["assigned_to"]
        else:
            data_dict["assigned_to"] = "No Data"

        if ("student_assigned_to" in machine):
            data_dict["student_assigned_to"] = machine["student_assigned_to"]
        else:
            data_dict["student_assigned_to"] = "No Data"

        if ("comments" in machine):
            data_dict["comments"] = machine["comments"]
        else:
            data_dict["comments"] = "No Data"

        break

    else:
        data_dict["assigned_to"] = "No data"
        data_dict["student_assigned_to"] = "No data"
        data_dict["comments"] = "No data"


    # obtain avg_cpu_util from data_collected and alter in data_dict
    avg_cpu_util = get_avg_cpu_util_info(log_path, machine_id)
    for log_date in avg_cpu_util:
        avg_cpu_util_val = avg_cpu_util[log_date]
        if avg_cpu_util_key in cpu_ram_disk_dict:
            cpu_ram_disk_dict[avg_cpu_util_key][log_date] = avg_cpu_util_val
        else:
            cpu_ram_disk_dict[avg_cpu_util_key]=dict()
            cpu_ram_disk_dict[avg_cpu_util_key][log_date] = avg_cpu_util_val

    # obtain avg_ram_util from data_collected and alter in data_dict
    avg_ram_util = get_avg_mem_util_info(log_path, machine_id)
    for log_date in avg_ram_util:
        avg_ram_util_val = avg_ram_util[log_date]
        if avg_ram_util_key in cpu_ram_disk_dict:
            cpu_ram_disk_dict[avg_ram_util_key][log_date] = avg_ram_util_val
        else:
            cpu_ram_disk_dict[avg_ram_util_key] = dict()
            cpu_ram_disk_dict[avg_ram_util_key][log_date] = avg_ram_util_val

    # obtain cpu_util from data_collected and alter in data_dict
    cpu_util = get_cpu_ram_data(log_path, machine_id, "cpu")
    log_date = os.path.basename(log_path)
    cpu_util_val = cpu_util[machine_id]
    if cpu_util_key in cpu_ram_disk_dict:
        cpu_ram_disk_dict[cpu_util_key][log_date] = cpu_util_val
    else:
        cpu_ram_disk_dict[cpu_util_key]=dict()
        cpu_ram_disk_dict[cpu_util_key][log_date] = cpu_util_val

    # obtain ram_util from data_collected and alter in data_dict
    ram_util = get_cpu_ram_data(log_path, machine_id, "ram")
    log_date = os.path.basename(log_path)
    ram_util_val = ram_util[machine_id]
    if ram_util_key in cpu_ram_disk_dict:
        cpu_ram_disk_dict[ram_util_key][log_date] = ram_util_val
    else:
        cpu_ram_disk_dict[ram_util_key]=dict()
        cpu_ram_disk_dict[ram_util_key][log_date] = ram_util_val


    # obtain disk-info from data_collected and alter in data_dict
    disk_info = get_disk_info(log_path, machine_id)
    fs_list = list(disk_info.keys())
    for each_fs in fs_list:
        if disk_info_key not in data_dict:
            data_dict[disk_info_key] = dict()
        if disk_info_key not in cpu_ram_disk_dict:
            cpu_ram_disk_dict[disk_info_key] = dict()

        if each_fs not in data_dict[disk_info_key]:
            data_dict[disk_info_key][each_fs] = dict()
        if each_fs not in cpu_ram_disk_dict[disk_info_key]:
            cpu_ram_disk_dict[disk_info_key][each_fs] = dict()

        data_dict[disk_info_key][each_fs]['total_GB'] = disk_info[each_fs]['total_GB']
        data_dict[disk_info_key][each_fs]['mounted_on'] = disk_info[each_fs]['mounted_on']

        if 'used_GB' not in cpu_ram_disk_dict[disk_info_key][each_fs]:
            cpu_ram_disk_dict[disk_info_key][each_fs]['used_GB'] = dict()

        log_date = list(disk_info[each_fs]['used_GB'].keys())[0]
        used_gb_val_for_log_date = disk_info[each_fs]['used_GB'][log_date]
        cpu_ram_disk_dict[disk_info_key][each_fs]['used_GB'][log_date] = used_gb_val_for_log_date

    # updating the document in db
    mach_col.update_one({machine_id_key : machine_id}, {'$set' : data_dict}, upsert=True)
    cpu_ram_disk_col.update_one({machine_id_key : machine_id}, {'$set' : cpu_ram_disk_dict}, upsert=True)

# read machinefile and update the room/rack configuration.
machine_file_path = os.path.join(sys.argv[1], "machinefile")
to_ret = get_rack_details(machine_file_path)
room_rack_col.update_one({"_id": 0}, {"$set": to_ret}, upsert=True)
