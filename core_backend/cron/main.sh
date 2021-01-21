#!/bin/sh

RLMON_HOME="${HOME}"/.r_lmon;
MACHINEFILE="${RLMON_HOME}"/machinefile;
RLMON_DEBUG=1;

. "${RLMON_HOME}"/core_backend/cron/utils/utils-main.sh;

IFS=","
while read REMOTE_MACHINE RACK_ID MACHINE_LOCATION KVM_SWITCH KVM_NUMBER
do
    main "${REMOTE_MACHINE}" "${RACK_ID}" "${MACHINE_LOCATION}" "${KVM_SWITCH}" "${KVM_NUMBER}";
done < "${MACHINEFILE}"
