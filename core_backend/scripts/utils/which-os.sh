#!/bin/sh

ssh -o PasswordAuthentication=no "${1}" "cat /etc/os-release" | grep "PRETTY_NAME" | cut -d "=" -f2 | xargs ; ( exit ${PIPESTATUS[0]} )
