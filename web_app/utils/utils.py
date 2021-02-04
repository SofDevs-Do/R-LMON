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
