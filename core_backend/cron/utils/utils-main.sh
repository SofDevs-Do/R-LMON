#!/bin/sh

. "${RLMON_HOME}"/core_backend/cron/utils/up-tests.sh;

main()
{
    REMOTE_MACHINE=$1;
    RACK_ID=$2;
    MACHINE_LOCATION=$3;
    KVM_SWITCH=$4;
    KVM_NUMBER=$5;

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
