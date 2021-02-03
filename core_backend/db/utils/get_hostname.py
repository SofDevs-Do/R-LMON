import os

HOSTNAME_FILE_NAME = "hostname.txt" # name of the filename in the log_path

def get_hostname_dict(log_path, machine, hostname_key):
    hostname_file = os.path.join(log_path, machine, HOSTNAME_FILE_NAME)
    with open(hostname_file, "r") as hostname_fp:
        hostname = hostname_fp.read().strip()
    return {hostname_key : hostname}
    
    

