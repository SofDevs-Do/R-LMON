import os

AVG_MEM_UTIL_INFO_FILE_NAME = "avg-mem-usage.txt" # name of the filename in the log_path

def get_avg_mem_util_info_dict(log_path, machine, avg_mem_util_info_key):
    t_date = os.path.basename(log_path)
    avg_mem_util_info_file = os.path.join(log_path, machine, AVG_MEM_UTIL_INFO_FILE_NAME)
    with open(avg_mem_util_info_file, "r") as avg_mem_util_info_fp:
        avg_mem_util_info = float(avg_mem_util_info_fp.read().strip())
    return {avg_mem_util_info_key : {t_date : avg_mem_util_info}}
    
    
