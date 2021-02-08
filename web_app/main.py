import random
import string

from flask import Flask
from flask import render_template

import utils.utils as utils


db_url = "mongodb://localhost:27017/"
backend_url = "http://127.0.0.1:8000"

app = Flask(__name__, static_url_path='', static_folder='static')
util_obj = utils.Util(db_url = db_url)


@app.route("/api/v2/overview-page-data/<string:color_coding_selector>/<string:from_date>/<string:to_date>",
           methods=['GET'])
def get_overview_page_cpu_ram_data(color_coding_selector, from_date, to_date):
    if (color_coding_selector == "CPU utilization"):
        to_ret = util_obj.get_overview_page_cpu_ram_data('avg_cpu_util', from_date, to_date)
    elif (color_coding_selector == "RAM utilization"):
        to_ret = util_obj.get_overview_page_cpu_ram_data('avg_ram_util', from_date, to_date)
    else:
        print("Not implemented warning")
        to_ret = dict()
    return to_ret


@app.route("/api/v2/overview-machine-meta-data/<string:machine_id>/<string:from_date>/<string:to_date>")
def get_machine_overview_meta_data(machine_id, from_date, to_date):
    to_ret = dict()
    to_ret["CPU"] = "{0:.2f}%".format(util_obj.get_average_ram_cpu_data('avg_cpu_util', machine_id, from_date, to_date))
    to_ret["RAM"] = "{0:.2f}%".format(util_obj.get_average_ram_cpu_data('avg_ram_util', machine_id, from_date, to_date))
    to_ret["machine_name"] = util_obj.get_machine_data(machine_id)["_id"]

    return to_ret


@app.route("/")
def index():
    return render_template("index.html")
