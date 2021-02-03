import os

IP_INFO_FILE_NAME = "ip.txt" # name of the filename in the log_path

def get_ip_info_dict(log_path, machine, ip_info_key):
    ip_info_file = os.path.join(log_path, machine, IP_INFO_FILE_NAME)
    with open(ip_info_file, "r") as ip_info_fp:
        ip_info = ip_info_fp.read().strip().split('\n')
    return {ip_info_key : ip_info}
    
    
