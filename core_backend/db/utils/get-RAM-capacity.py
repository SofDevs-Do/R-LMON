import os

RAM_CAPACITY_FILE_NAME = "ram-capacity.txt" # name of the filename in the log_path

def get_ram_capacity_dict(log_path, machine, ram_capacity_key):
    ram_capacity_file = os.path.join(log_path, machine, RAM_CAPACITY_FILE_NAME)
    with open(ram_capacity_file, "r") as ram_capacity_fp:
        ram_capacity = round(float(ram_capacity_fp.read().strip()),2) # RAM capacity reported in GB
    return {ram_capacity_key : ram_capacity}
    
    

