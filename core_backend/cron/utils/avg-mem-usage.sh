#!/bin/sh

ssh -o PasswordAuthentication=no "${1}" "LC_TIME='POSIX' sar -r -1" | \
    sed -ne '/Average/p' | tail -n 1 | awk 'OFS="," {print $(NF-3)}'; ( exit ${PIPESTATUS[0]} )
