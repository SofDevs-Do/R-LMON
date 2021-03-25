from flask import Flask
import utils.utils as utils

app = Flask(__name__)
util_obj = utils.Util()

@app.route("/api/v2/core-backend/machine-ctrl/<string:machine_address>/<string:operation>")
def machine_ctrl(machine_address, operation):
    to_ret = util_obj.machine_ctrl(machine_address, operation)
    return to_ret

@app.route("/api/v2/core-backend/get-syslog/<string:machine_address>")
def get_syslog(machine_address):
    to_ret = util_obj.get_syslog(machine_address)
    return to_ret
