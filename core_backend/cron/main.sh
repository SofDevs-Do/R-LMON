#!/bin/sh

RLMON_HOME="${HOME}"/.r_lmon;
MACHINEFILE="${RLMON_HOME}"/machinefile;
RLMON_DEBUG=1;

. "${RLMON_HOME}"/core_backend/cron/utils/utils-main.sh;

IFS=","
grep -v '^#' < "${MACHINEFILE}" | \
    { while read MACHINE_ID REMOTE_MACHINE ROOM_ID RACK_ID MACHINE_LOCATION KVM_SWITCH KVM_NUMBER ALLOTED_TO COMMENTS
      do
	  main \
	      "$(echo ${REMOTE_MACHINE} | xargs)" \
	      "$(echo ${ROOM_ID} | xargs)" \
	      "$(echo ${RACK_ID} | xargs)" \
	      "$(echo ${MACHINE_LOCATION} | xargs)" \
	      "$(echo ${KVM_SWITCH} | xargs)" \
	      "$(echo ${KVM_NUMBER} | xargs)" \
	      "$(echo ${ALLOTED_TO} | xargs)" \
	      "$(echo ${COMMENTS} | xargs)" \
	      "$(echo ${MACHINE_ID} | xargs)";
      done; }
