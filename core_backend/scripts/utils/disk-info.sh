#!/bin/sh

ssh -o PasswordAuthentication=no "${1}" "df -h" | grep "/dev/sd" ; ( exit ${PIPESTATUS[0]} )

# Output feild names: Filesystem Size Used Avail Use% MountedOn
