#!/bin/sh

. "${RLMON_HOME}"/core_backend/cron/utils/up-tests.sh;

main()
{
    REMOTE_MACHINE="${1}";
    ROOM_ID="${2}";
    RACK_ID="${3}";
    MACHINE_LOCATION="${4}";
    KVM_SWITCH="${5}";
    KVM_NUMBER="${6}";
    ALLOTED_TO="${7}";
    COMMENTS="${8}"

    # The location to store the collected data from each remote machine.
    REMOTE_MACHINE_PATH="${RLMON_HOME}"/core_backend/_log/"$(date --date="yesterday" '+%Y-%m-%d')/${REMOTE_MACHINE}";
    mkdir -p "${REMOTE_MACHINE_PATH}";
    echo "Collecting from ${REMOTE_MACHINE}";

    ping_test "${REMOTE_MACHINE}"

    if [ $? -eq 0 ]; then
	# remove the ping test status file as the test passed now.
	if [ -f "${REMOTE_MACHINE_PATH}"/ping-down ]; then
	    rm "${REMOTE_MACHINE_PATH}"/ping-down;
	fi

	check_ssh "${REMOTE_MACHINE}"
	if [ $? -eq 0 ]; then
	    # remove the ssh test status file as the test passed now.
	    if [ -f "${REMOTE_MACHINE_PATH}"/ssh-down ]; then
		rm "${REMOTE_MACHINE_PATH}"/ssh-down;
	    fi

	    # TODO: Currently information that don't change very
	    # frequently are collected at very small intervals. This might cause
	    # storage and performance related issues when planning for scalability.
	    # Maybe setup a separate pipeline for these information?
	    echo "${ROOM_ID}" > "${REMOTE_MACHINE_PATH}"/misc-info.txt
	    echo "${RACK_ID}" >> "${REMOTE_MACHINE_PATH}"/misc-info.txt
	    echo "${MACHINE_LOCATION}" >> "${REMOTE_MACHINE_PATH}"/misc-info.txt
	    echo "${KVM_SWITCH}" >> "${REMOTE_MACHINE_PATH}"/misc-info.txt
	    echo "${KVM_NUMBER}" >> "${REMOTE_MACHINE_PATH}"/misc-info.txt
	    echo "${ALLOTED_TO}" >> "${REMOTE_MACHINE_PATH}"/misc-info.txt
	    echo "${COMMENTS}" >> "${REMOTE_MACHINE_PATH}"/misc-info.txt


	    ## Data collection scripts being invoked.
	    # Get hostname details
	    bash "${RLMON_HOME}"/core_backend/cron/utils/hostname.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/hostname.txt < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/hostname.txt;
		touch "${REMOTE_MACHINE_PATH}"/hostname-down;
	    fi
	    

	    # CPU Usage stats collection.
	    bash "${RLMON_HOME}"/core_backend/cron/utils/cpu-usage.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/cpu-usage.csv < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/cpu-usage.csv;
		touch "${REMOTE_MACHINE_PATH}"/cpu-test-down;
	    fi

	    bash "${RLMON_HOME}"/core_backend/cron/utils/avg-cpu-usage.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/avg-cpu-usage.txt < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/avg-cpu-usage.txt;
		touch "${REMOTE_MACHINE_PATH}"/avg-cpu-test-down;
	    fi


	    # RAM Usage stats collection
	    bash "${RLMON_HOME}"/core_backend/cron/utils/mem-usage.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/mem-usage.csv < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/mem-usage.csv;
		touch "${REMOTE_MACHINE_PATH}"/mem-test-down;
	    fi

	    bash "${RLMON_HOME}"/core_backend/cron/utils/avg-mem-usage.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/avg-mem-usage.txt < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/avg-mem-usage.txt;
		touch "${REMOTE_MACHINE_PATH}"/avg-mem-test-down;
	    fi


	    # Uptime of the system
	    bash "${RLMON_HOME}"/core_backend/cron/utils/uptime.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/uptime.txt < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/uptime.txt;
		touch "${REMOTE_MACHINE_PATH}"/uptime-down;
	    fi

	    # IPs of the system
	    bash "${RLMON_HOME}"/core_backend/cron/utils/get-ip.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/ip.txt < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/ip.txt;
		touch "${REMOTE_MACHINE_PATH}"/ip-test-down;
	    fi

	    # CPU model of the system
	    bash "${RLMON_HOME}"/core_backend/cron/utils/cpu-model.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/cpu-model.txt < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/cpu-model.txt;
		touch "${REMOTE_MACHINE_PATH}"/cpu-model-test-down;
	    fi

	    # RAM capacity of the system
	    bash "${RLMON_HOME}"/core_backend/cron/utils/ram-capacity.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/ram-capacity.txt < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/ram-capacity.txt;
		touch "${REMOTE_MACHINE_PATH}"/ram-capacity-test-down;
	    fi

	    # OS info of the system
	    bash "${RLMON_HOME}"/core_backend/cron/utils/which-os.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/os-info.txt < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/os-info.txt;
		touch "${REMOTE_MACHINE_PATH}"/os-info-test-down;
	    fi

	    # list users of the system
	    bash "${RLMON_HOME}"/core_backend/cron/utils/list-users.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/list-users.txt < /dev/null;

	    # last login info for users of the system
	    bash "${RLMON_HOME}"/core_backend/cron/utils/last-login-info.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/last-login-info.txt < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/last-login-info.txt;
		touch "${REMOTE_MACHINE_PATH}"/last-login-info-test-down;
	    fi

	    # Disk utilization of the system
	    bash "${RLMON_HOME}"/core_backend/cron/utils/disk-info.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/disk-info.txt < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/disk-info.txt;
		touch "${REMOTE_MACHINE_PATH}"/disk-info-test-down;
	    fi

	    # Swap space info of the system
	    bash "${RLMON_HOME}"/core_backend/cron/utils/swap-info.sh \
		 "${REMOTE_MACHINE}" > "${REMOTE_MACHINE_PATH}"/swap-info.txt < /dev/null;
	    if [ $? -ne 0 ]; then
		rm -f "${REMOTE_MACHINE_PATH}"/swap-info.txt;
		touch "${REMOTE_MACHINE_PATH}"/swap-info-test-down;
	    fi

	    ## end of data collection scripts being invoked.

	else # failed ssh test. Make a file to indicate this in the remote machine's log directory
	    echo "Unable to remotely login to host - ${REMOTE_MACHINE}";
	    touch "${REMOTE_MACHINE_PATH}"/ssh-down;
	fi

    else # failed ping test. Make a file to indicate this in the remote machine's log directory
	echo "Unable to reach host - ${REMOTE_MACHINE}";
	touch "${REMOTE_MACHINE_PATH}"/ping-down;
    fi
}
