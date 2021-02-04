import random
import string

from flask import Flask
from flask import render_template

app = Flask(__name__,
            static_url_path='',
            static_folder='static')

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/v2/overview-page-data/<string:color_coding_selector>/<string:from_date>/<string:to_date>",
           methods=['GET'])
def get_overview_page_data(color_coding_selector, from_date, to_date):
    to_ret = {
	0: {
	    'room_name': 'server room 1',
	    'rack_list': {
		0: {
		    'rack_name': 'rack A',
		    'machine_list': [{0:random.randint(-1,100)}, {1:random.randint(-1,100)},
                                     {2:random.randint(-1,100)}, {3:random.randint(-1,100)},
                                     {4:random.randint(-1,100)}, {5:random.randint(-1,100)},
                                     {6:random.randint(-1,100)}, {7:random.randint(-1,100)},
                                     {8:random.randint(-1,100)}, {9:random.randint(-1,100)}]
		},
		1: {
		    'rack_name': 'rack B',
		    'machine_list': [{10:random.randint(-1,100)}, {11:random.randint(-1,100)},
                                     {12:random.randint(-1,100)}, {13:random.randint(-1,100)},
                                     {14:random.randint(-1,100)}, {15:random.randint(-1,100)},
                                     {16:random.randint(-1,100)}, {17:random.randint(-1,100)},
                                     {18:random.randint(-1,100)}, {19:random.randint(-1,100)}]
		},
		2: {
		    'rack_name': 'rack C',
		    'machine_list': [{20:random.randint(-1,100)}, {21:random.randint(-1,100)},
                                     {22:random.randint(-1,100)}, {23:random.randint(-1,100)},
                                     {24:random.randint(-1,100)}, {25:random.randint(-1,100)},
                                     {26:random.randint(-1,100)}, {27:random.randint(-1,100)},
                                     {28:random.randint(-1,100)}, {29:random.randint(-1,100)}]
		},
		3: {
		    'rack_name': 'rack D',
		    'machine_list': [{30:random.randint(-1,100)}, {31:random.randint(-1,100)},
                                     {32:random.randint(-1,100)}, {33:random.randint(-1,100)},
                                     {34:random.randint(-1,100)}, {35:random.randint(-1,100)},
                                     {36:random.randint(-1,100)}, {37:random.randint(-1,100)},
                                     {38:random.randint(-1,100)}, {39:random.randint(-1,100)}]
		},
		4: {
		    'rack_name': 'rack E',
		    'machine_list': [{40:random.randint(-1,100)}, {51:random.randint(-1,100)},
                                     {42:random.randint(-1,100)}, {53:random.randint(-1,100)},
                                     {44:random.randint(-1,100)}, {55:random.randint(-1,100)},
                                     {46:random.randint(-1,100)}, {57:random.randint(-1,100)},
                                     {48:random.randint(-1,100)}, {59:random.randint(-1,100)}]
		},
	    }
	}
    }
    return to_ret

@app.route("/api/dev/test/v2")
def v2():
    to_ret = {
	"CPU": random.randint(-1,100),
	"RAM": random.randint(-1,100),
	"machine_name": ''.join(random.choices(string.ascii_letters+string.digits, k=5))
    }

    return to_ret
