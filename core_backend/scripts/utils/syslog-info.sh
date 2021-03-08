#!/bin/sh

ssh -o PasswordAuthentication=no "$1" "cat /var/log/syslog"; ( exit ${PIPESTATUS[0]} )
