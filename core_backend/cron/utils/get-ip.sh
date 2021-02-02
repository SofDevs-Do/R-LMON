#!/bin/sh

ssh -o PasswordAuthentication=no "${1}" "ip a" \
    | grep "inet " | grep -v "127.0.0.1" | sed -E "s/(.*)inet (.*)\/(.*) brd(.*)/\2/"; ( exit ${PIPESTATUS[0]} )
