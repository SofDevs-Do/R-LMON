import os

USERS_LAST_LOGIN_INFO_FILE_NAME = "last-login-info.txt" # name of the filename in the log_path

def get_users_last_login_dict(log_path, machine, users_last_login_info_key):
    users_last_login_info_file = os.path.join(log_path, machine, USERS_LAST_LOGIN_INFO_FILE_NAME)
    with open(users_last_login_info_file, "r") as users_last_login_info_fp:
        users_last_login_info = users_last_login_info_fp.read().strip().split('\n')
    data_dict = dict()
    for each_user_data in users_last_login_info:
        data = each_user_data.split()
        user = data[0]
        if len(data) != 4:
            last_login_info = ' '.join(data[3:-2])
        else:
            last_login_info = ' '.join(data[1:])
        data_dict[user] = last_login_info
    return {users_last_login_info_key : data_dict}

                                           
    
    
