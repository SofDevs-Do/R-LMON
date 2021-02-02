from utils.utils import Util
from flask import Flask

app = Flask(__name__)

util_obj = Util()

@app.route("/api/v2/get-machines/<string:start_date>/<string:end_date>",
           methods=['GET'])
def get_machines(start_date, end_date):
    machines = util_obj.get_overview_data(start_date, end_date)
    return machines
