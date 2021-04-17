import os
import subprocess

class Util:

    def __init__(self):
        pass

    def machine_ctrl(self, machine_address, operation):
        cmd_prefix = "systemctl -H " + machine_address
        if (operation == "shutdown"):
            cmd_suffix = " poweroff"
        elif (operation == "reboot"):
            cmd_suffix = " reboot"

        response = os.system(cmd_prefix + cmd_suffix)
        if (response == 0):
            return("{} successful".format(operation))

        return("{} failed".format(operation))

    def get_syslog(self, machine_address):
        operation = "get_syslog_info"
        _operation = "cat /var/log/syslog"
        _command = "ssh -o PasswordAuthentication=no " + machine_address + " " + _operation
        response = subprocess.check_output(_command, shell=True)
        # response = os.system("ssh -o PasswordAuthentication=no " + machine_address + " " + _operation, shell=True)
        # if (response == 0):
        #     return("{} successful".format(operation))
        # return("{} failed".format(operation))
        return response
