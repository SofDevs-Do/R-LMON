#!/bin/sh

ping_test()
{
    # Ping the machine 10 times to check if it is reachable.
    # as the $1 variable will have the format username@address,
    # we extract the address and only ping that.
    echo "ping test in progress for ${1}";
    ping -c 5 "${1##*@}" &> /dev/null;
}

check_ssh()
{
    # check if ssh can be used. This can be done in two ways,
    # the 'nc' based command is fast, but might miss out some
    # cases ?.
    echo "ssh test in progress for ${1}";
    nc -4 -d -z -w 15 "${1##*@}" 22 &> /dev/null;

    # Instead the ssh based command can be used, but might take longer
    # than the previous command.
    
    # ssh "${1}" "hostname" 1>/dev/null 2>&1;
}
