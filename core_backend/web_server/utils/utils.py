import os

class Util:

    def __init__(self):
        pass

    def machine_ctrl(self, machine_address, operation):
        if (operation == "shutdown"):
            _operation = " '/sbin/shutdown 0'"
        elif (operation == "reboot"):
            _operation = " '/sbin/reboot'"

        response = os.system("ssh -o PasswordAuthentication=no " + machine_address + _operation)
        if (response == 0):
            return("{} successful".format(operation))

        return("{} failed".format(operation))
