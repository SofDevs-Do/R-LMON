import os

DISK_INFO_FILE_NAME = "disk-info.txt" # name of the filename in the log_path

def get_disk_info_dict(log_path, machine, disk_info_key):
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
    return {disk_info_key : disk_data}

    
    
