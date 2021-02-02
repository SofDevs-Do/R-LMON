#!/bin/sh

ssh -o PasswordAuthentication=no "${1}" "lscpu" | grep 'Model name:' | cut -d ':' -f2 | xargs; ( exit ${PIPESTATUS[0]} )
