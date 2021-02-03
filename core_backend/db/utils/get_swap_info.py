import os

SWAP_INFO_FILE_NAME = "swap-info.txt" # name of the filename in the log_path

def get_swap_info_dict(log_path, machine, swap_info_key):
    swap_info_file = os.path.join(log_path, machine, SWAP_INFO_FILE_NAME)
    with open(swap_info_file, "r") as swap_info_fp:
        swap_info = round((float(swap_info_fp.read().strip().split('\n')[1].split()[1])/(1024 * 1024)),2)  # value in GB
    return {swap_info_key : swap_info}

    
    
