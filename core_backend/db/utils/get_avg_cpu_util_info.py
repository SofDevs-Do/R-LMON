import os

AVG_CPU_UTIL_INFO_FILE_NAME = "avg-cpu-usage.txt" # name of the filename in the log_path

def get_avg_cpu_util_info_dict(log_path, machine, avg_cpu_util_info_key):
    avg_cpu_util_info_file = os.path.join(log_path, machine, AVG_CPU_UTIL_INFO_FILE_NAME)
    with open(avg_cpu_util_info_file, "r") as avg_cpu_util_info_fp:
        avg_cpu_util_info = float(avg_cpu_util_info_fp.read().strip())
    return {avg_cpu_util_info_key : avg_cpu_util_info}
    
    
