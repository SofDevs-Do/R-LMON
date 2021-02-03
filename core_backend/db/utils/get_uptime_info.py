import os

UPTIME_INFO_FILE_NAME = "uptime.txt" # name of the filename in the log_path

def get_uptime_info_dict(log_path, machine, uptime_info_key):
    uptime_info_file = os.path.join(log_path, machine, UPTIME_INFO_FILE_NAME)
    with open(uptime_info_file, "r") as uptime_info_fp:
        uptime_info = uptime_info_fp.read().split('up')[-1].strip()
    return {uptime_info_key : uptime_info}
    
    
