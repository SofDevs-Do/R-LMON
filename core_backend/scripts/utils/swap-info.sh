#!/bin/sh

ssh -o PasswordAuthentication=no "${1}" "cat /proc/meminfo" | grep -i "swap"; ( exit ${PIPESTATUS[0]} )
