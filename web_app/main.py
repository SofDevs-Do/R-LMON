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
def get_overview_page_data(color_coding_selector, from_date, to_date):
    to_ret = util_obj.get_overview_page_data(color_coding_selector, from_date, to_date)
    return to_ret


@app.route("/api/dev/test/v2")
def v2():
    to_ret = {
	"CPU": random.randint(-1,100),
	"RAM": random.randint(-1,100),
	"machine_name": ''.join(random.choices(string.ascii_letters+string.digits, k=5))
    }

    return to_ret


@app.route("/")
def index():
    return render_template("index.html")
