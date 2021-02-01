import os
import errno

class Util:

    hours_list = list(range(24))
    rlmon_path = os.path.join(os.environ.get('HOME'), ".r_lmon")
    log_dir = os.path.join(rlmon_path, "core_backend", "_log")

    def __init__(self):

        # Check if the static data members are correct.
        if (not os.path.isdir(Util.rlmon_path)):
            raise FileNotFoundError(errno.ENOENT, os.strerror(errno.ENOENT), Util.rlmon_path)

        if (not os.path.isdir(Util.log_dir)):
            raise FileNotFoundError(errno.ENOENT, os.strerror(errno.ENOENT), Util.log_dir)
