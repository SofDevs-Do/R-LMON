import os

# name of the filename in the log_path
HOSTNAME_FILE_NAME              = "hostname.txt"
IP_INFO_FILE_NAME               = "ip.txt"
OS_INFO_FILE_NAME               = "os-info.txt"
CPU_MODEL_FILE_NAME             = "cpu-model.txt"
RAM_CAPACITY_FILE_NAME          = "ram-capacity.txt"
SWAP_INFO_FILE_NAME             = "swap-info.txt"
UPTIME_INFO_FILE_NAME           = "uptime.txt"
USERS_LAST_LOGIN_INFO_FILE_NAME = "last-login-info.txt" 
AVG_CPU_UTIL_INFO_FILE_NAME     = "avg-cpu-usage.txt"
AVG_MEM_UTIL_INFO_FILE_NAME     = "avg-mem-usage.txt"
DISK_INFO_FILE_NAME             = "disk-info.txt" 


def get_rack_details(machine_file_path):
    lines = []
    toret = dict()

    with open(machine_file_path, 'r') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()

        # ignore lines that are comments
        if line[0] == '#':
            continue

        _fields = line.split(',')
        fields = []
        for field in _fields:
            fields.append(field.strip())

        # MACHINE_ID REMOTE_MACHINE ROOM_ID RACK_ID MACHINE_LOCATION KVM_SWITCH KVM_NUMBER ALLOTED_TO COMMENTS
        # Make a dict for each room.
        if fields[2] not in toret:
            toret[fields[2]] = {"rack_list": dict()}

        # Make a dict for each rack in it's room.
        if fields[3] not in toret[fields[2]]["rack_list"]:
            toret[fields[2]]["rack_list"][fields[3]] = {"machine_list": dict()}

        # For each machine, make a dictionary. However, the
        # key is the position of the machine, and the value is a dictionary
        # with only one field: "_id": <machine-id>
        toret[fields[2]]["rack_list"][fields[3]]["machine_list"][fields[4]] = {"_id": fields[0]}

    return toret


def get_disk_info(log_path, machine):
    machine = str(machine)
    t_date = os.path.basename(log_path)
    disk_info_file = os.path.join(log_path, machine, DISK_INFO_FILE_NAME)
    with open(disk_info_file, "r") as disk_info_fp:
        disk_info = disk_info_fp.read().strip().split('\n')
    disk_data = dict()
    for each_fs_info in disk_info:
        each_fs_info_l = each_fs_info.split()
        fs = each_fs_info_l[0]
        total_GB = each_fs_info_l[1][:-1]
        used_GB = each_fs_info_l[2][:-1]
        mounted_on = each_fs_info_l[5]
        disk_data[fs] = {'total_GB': total_GB, 'used_GB': {t_date : used_GB}, 'mounted_on': mounted_on}
    return disk_data

def get_avg_mem_util_info(log_path, machine):
    t_date = os.path.basename(log_path)
    machine = str(machine)
    avg_mem_util_info_file = os.path.join(log_path, machine, AVG_MEM_UTIL_INFO_FILE_NAME)
    with open(avg_mem_util_info_file, "r") as avg_mem_util_info_fp:
        avg_mem_util_info = float(avg_mem_util_info_fp.read().strip())
    return {t_date : avg_mem_util_info}

def get_avg_cpu_util_info(log_path, machine):
    machine = str(machine)
    t_date = os.path.basename(log_path)
    avg_cpu_util_info_file = os.path.join(log_path, machine, AVG_CPU_UTIL_INFO_FILE_NAME)
    with open(avg_cpu_util_info_file, "r") as avg_cpu_util_info_fp:
        avg_cpu_util_info = float(avg_cpu_util_info_fp.read().strip())
    return {t_date : avg_cpu_util_info}

def get_users_last_login(log_path, machine):
    machine = str(machine)
    users_last_login_info_file = os.path.join(log_path, machine, USERS_LAST_LOGIN_INFO_FILE_NAME)
    with open(users_last_login_info_file, "r") as users_last_login_info_fp:
        users_last_login_info = users_last_login_info_fp.read().strip().split('\n')
    data_dict = dict()
    for each_user_data in users_last_login_info:
        data = each_user_data.split()
        user = data[0]
        if len(data) != 4:
            last_login_info = ' '.join(data[3:-2])
        else:
            last_login_info = ' '.join(data[1:])
        data_dict[user] = last_login_info
    return data_dict

def get_uptime_info(log_path, machine):
    machine = str(machine)
    uptime_info_file = os.path.join(log_path, machine, UPTIME_INFO_FILE_NAME)
    with open(uptime_info_file, "r") as uptime_info_fp:
        uptime_info = uptime_info_fp.read().split('up')[-1].strip()
    return uptime_info

def get_swap_info(log_path, machine):
    machine = str(machine)
    swap_info_file = os.path.join(log_path, machine, SWAP_INFO_FILE_NAME)
    with open(swap_info_file, "r") as swap_info_fp:
        swap_info = round((float(swap_info_fp.read().strip().split('\n')[1].split()[1])/(1024 * 1024)),2)  # value in GB
    return swap_info

def get_ram_capacity(log_path, machine):
    machine = str(machine)
    ram_capacity_file = os.path.join(log_path, machine, RAM_CAPACITY_FILE_NAME)
    with open(ram_capacity_file, "r") as ram_capacity_fp:
        ram_capacity = round(float(ram_capacity_fp.read().strip()),2) # RAM capacity reported in GB
    return ram_capacity

def get_cpu_model(log_path, machine):
    machine = str(machine)
    cpu_model_file = os.path.join(log_path, machine, CPU_MODEL_FILE_NAME)
    with open(cpu_model_file, "r") as cpu_model_fp:
        cpu_model = cpu_model_fp.read().strip()
    return cpu_model

def get_os_info(log_path, machine):
    machine = str(machine)
    os_info_file = os.path.join(log_path, machine, OS_INFO_FILE_NAME)
    with open(os_info_file, "r") as os_info_fp:
        os_info = os_info_fp.read().strip()
    return os_info

def get_hostname(log_path, machine):
    machine = str(machine)
    hostname_file = os.path.join(log_path, machine, HOSTNAME_FILE_NAME)
    with open(hostname_file, "r") as hostname_fp:
        hostname = hostname_fp.read().strip()
    return hostname

def get_ip_info(log_path, machine):
    machine = str(machine)
    ip_info_file = os.path.join(log_path, machine, IP_INFO_FILE_NAME)
    with open(ip_info_file, "r") as ip_info_fp:
        ip_info = ip_info_fp.read().strip().split('\n')
    return  ip_info
