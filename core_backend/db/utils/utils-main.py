import sys
import pymongo
import warnings

# connecting to Mongo server
myclient = pymongo.MongoClient("mongodb://localhost:27017/")

# accessing the rlmon_db
rlmon_db = myclient["rlmon_db"]

# warn if db being created for the first time.
dblist = myclient.list_database_names()
if "rlmon_db" not in dblist:
    warnings.warn('\'rlmon_db\' was not found to exist. Creating it newly.')

# obtaining the list of collections for rlmon_db
col_list = rlmon_db.list_collection_names()

# accessing room_col collection.
room_col = rlmon_db['room_col']

# warn if room_col being created for the first time.
if 'room_col' not in col_list:
    warnings.warn('\'room_col\' collection was not found to exist. Creating it newly.')

# accessing rack_col collection.
rack_col = rlmon_db['rack_col']

# warn if rack_col being created for the first time.
if 'rack_col' not in col_list:
    warnings.warn('\'rack_col\' collection was not found to exist. Creating it newly.')

# accessing mach_col collection.
mach_col = rlmon_db['mach_col']

# warn if mach_col being created for the first time.
if 'mach_col' not in col_list:
    warnings.warn('\'mach_col\' collection was not found to exist. Creating it newly.')


# accessing the path of data collection log for present day.
log_path = sys.argv[1]

# obtaining the present date from path
today_date = os.path.basename(log_path)

