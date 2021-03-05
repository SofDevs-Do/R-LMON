#!/bin/sh

ssh -o PasswordAuthentication=no "${1}" "LC_TIME='POSIX' sar -1" | \
    sed -e 's/\(.*Average.*\)//g' \
        -e 's/\(.*CPU.*\)//g' \
        -e 's/\(.*RESTART.*\)//g' \
	-e '/^$/d' | \
    awk 'OFS="," {print $1,100-$8}'; ( exit ${PIPESTATUS[0]} )
