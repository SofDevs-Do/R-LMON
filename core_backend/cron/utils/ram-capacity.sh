#!/bin/sh

echo "$(ssh -o PasswordAuthentication=no "${1}" 'cat /proc/meminfo' | grep "MemTotal" | cut -d ":" -f2 | xargs | cut -d " " -f1)/(1024*1024)" \
    | bc -l
