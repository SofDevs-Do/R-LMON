#!/bin/sh

ssh -o PasswordAuthentication=no "$1" "eval lastlog -u $(awk '/^UID_MIN/ {print $2}' /etc/login.defs)-$(awk '/^UID_MAX/ {print $2}' /etc/login.defs)" | \
    tail -n +2; ( exit ${PIPESTATUS[0]} )
