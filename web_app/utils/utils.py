import random
import string
import pymongo

class Util:

    def __init__(self, db_url):
        self.db_url = db_url
        self.db_client = pymongo.MongoClient(self.db_url)
        self.db = self.db_client["rlmon_db"]

        self.mach_col = self.db['mach_col']


    def get_overview_page_data(self, color_coding_selector, from_date, to_date):
        to_ret = {
	    "Server room 1": {
	        'rack_list': {
		    'Rack A': {
		        'machine_list': {0:{"_id": "000", "value":random.randint(-1,100)},  1:{"_id": "001", "value":random.randint(-1,100)},
                                         2:{"_id": "002", "value":random.randint(-1,100)},  3:{"_id": "003", "value":random.randint(-1,100)},
                                         4:{"_id": "004", "value":random.randint(-1,100)},  5:{"_id": "005", "value":random.randint(-1,100)},
                                         6:{"_id": "006", "value":random.randint(-1,100)},  7:{"_id": "007", "value":random.randint(-1,100)},
                                         8:{"_id": "008", "value":random.randint(-1,100)},  9:{"_id": "009", "value":random.randint(-1,100)},
                                         10:{"_id": "010", "value":random.randint(-1,100)},11:{"_id": "011", "value":random.randint(-1,100)},
                                         12:{"_id": "012", "value":random.randint(-1,100)},13:{"_id": "013", "value":random.randint(-1,100)},
                                         14:{"_id": "014", "value":random.randint(-1,100)},15:{"_id": "015", "value":random.randint(-1,100)}}
                    },
                    'Rack B': {
		        'machine_list': {16:{"_id": "016", "value":random.randint(-1,100)}, 17:{"_id": "017", "value":random.randint(-1,100)},
                                         18:{"_id": "018", "value":random.randint(-1,100)}, 19:{"_id": "019", "value":random.randint(-1,100)},
                                         20:{"_id": "020", "value":random.randint(-1,100)}, 21:{"_id": "021", "value":random.randint(-1,100)},
                                         22:{"_id": "022", "value":random.randint(-1,100)}, 23:{"_id": "023", "value":random.randint(-1,100)},
                                         24:{"_id": "024", "value":random.randint(-1,100)}, 25:{"_id": "025", "value":random.randint(-1,100)},
                                         26:{"_id": "026", "value":random.randint(-1,100)}, 27:{"_id": "027", "value":random.randint(-1,100)},
                                         28:{"_id": "028", "value":random.randint(-1,100)}, 29:{"_id": "029", "value":random.randint(-1,100)},
                                         30:{"_id": "030", "value":random.randint(-1,100)}, 31:{"_id": "031", "value":random.randint(-1,100)}}
                    }
	        }
	    }
        }
        return to_ret
