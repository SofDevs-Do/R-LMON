import os

OS_INFO_FILE_NAME = "os-info.txt" # name of the filename in the log_path

def get_os_info_dict(log_path, machine, os_info_key):
    os_info_file = os.path.join(log_path, machine, OS_INFO_FILE_NAME)
    with open(os_info_file, "r") as os_info_fp:
        os_info = os_info_fp.read().strip()
    return {os_info_key : os_info}
    
    
