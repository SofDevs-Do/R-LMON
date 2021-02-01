#!/bin/sh

RLMON_HOME="${HOME}"/.r_lmon;
MACHINEFILE="${RLMON_HOME}"/machinefile;
RLMON_DEBUG=1;

. "${RLMON_HOME}"/core_backend/cron/utils/utils-main.sh;

IFS=","
grep -v '^#' < "${MACHINEFILE}" | \
    { while read REMOTE_MACHINE ROOM_ID RACK_ID MACHINE_LOCATION KVM_SWITCH KVM_NUMBER ALLOTED_TO COMMENTS
      do
	  main "${REMOTE_MACHINE}" "${ROOM_ID}" "${RACK_ID}" "${MACHINE_LOCATION}" "${KVM_SWITCH}" "${KVM_NUMBER}" "${ALLOTED_TO}" "${COMMENTS}";
      done; }
