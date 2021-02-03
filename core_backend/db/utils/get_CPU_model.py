import os

CPU_MODEL_FILE_NAME = "cpu-model.txt" # name of the filename in the log_path

def get_cpu_model_dict(log_path, machine, cpu_model_key):
    cpu_model_file = os.path.join(log_path, machine, CPU_MODEL_FILE_NAME)
    with open(cpu_model_file, "r") as cpu_model_fp:
        cpu_model = cpu_model_fp.read().strip()
    return {cpu_model_key : cpu_model}
    
    

