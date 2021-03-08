#!/bin/sh

ssh -o PasswordAuthentication=no "${1}" "uptime -p"
