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

@app.route("/api/dev/test/v1")
def v1():
    to_ret = {
	0: {
	    'room_name': 'server room 1',
	    'rack_list': {
		0: {
		    'rack_name': 'rack A',
		    'machine_list': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
		},
		1: {
		    'rack_name': 'rack B',
		    'machine_list': [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
		},
		2: {
		    'rack_name': 'rack C',
		    'machine_list': [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
		},
		3: {
		    'rack_name': 'rack D',
		    'machine_list': [30, 31, 32, 33, 34, 35, 36, 37, 38, 39]
		},
		4: {
		    'rack_name': 'rack E',
		    'machine_list': [40, 41, 42, 43, 44, 45, 46, 47, 48, 49]
		},
	    }
	}
    }
    return to_ret

@app.route("/api/dev/test/v2")
def v2():
    to_ret = {
	"CPU": random.randint(1,100),
	"RAM": random.randint(1,100),
	"machine_name": ''.join(random.choices(string.ascii_letters+string.digits, k=5))
    }

    return to_ret
