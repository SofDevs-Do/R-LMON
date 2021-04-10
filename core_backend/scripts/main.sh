#!/bin/sh

RLMON_HOME="${HOME}"/.r_lmon;
MACHINEFILE="${RLMON_HOME}"/machinefile;
LOG_DATE_PATH="${RLMON_HOME}"/core_backend/_log/"$(date --date="yesterday" '+%Y-%m-%d')";

. "${RLMON_HOME}"/core_backend/scripts/utils/utils-main.sh;

IFS=","
grep -v '^#' < "${MACHINEFILE}" | \
    { while read MACHINE_ID REMOTE_MACHINE ROOM_ID RACK_ID MACHINE_LOCATION KVM_SWITCH KVM_NUMBER PROF_ALLOTED_TO STUDENT_ALLOTED_TO COMMENTS
      do
	  main \
	      "$(echo ${REMOTE_MACHINE} | xargs)" \
	      "$(echo ${ROOM_ID} | xargs)" \
	      "$(echo ${RACK_ID} | xargs)" \
	      "$(echo ${MACHINE_LOCATION} | xargs)" \
	      "$(echo ${KVM_SWITCH} | xargs)" \
	      "$(echo ${KVM_NUMBER} | xargs)" \
	      "$(echo ${PROF_ALLOTED_TO} | xargs)" \
	      "$(echo ${STUDENT_ALLOTED_TO} | xargs)" \
	      "$(echo ${COMMENTS} | xargs)" \
	      "$(echo ${MACHINE_ID} | xargs)";
      done; }

python3 "${RLMON_HOME}"/core_backend/db/update-db.py "${RLMON_HOME}" "$(date --date="yesterday" '+%Y-%m-%d')";
python3 "${RLMON_HOME}"/core_backend/scripts/maintanance.py;
