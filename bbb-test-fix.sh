#!/usr/bin/env bash

while [ -n "$1" ]; do
  case $1 in
    #--x|-x) set -x ;;
    --host|-h) shift; HOST="$1" ;;
    --number|-n) shift; NUMBER="$1" ;;
    --room|-r) shift; ROOM="$1" ;;
    --head) shift; HEAD="true" ;;
    --mac) shift; IP="$(curl ifconfig.me)" ;;
    --unix) shift; IP="$(hostname -I | cut -f1 -d ' ')" ;;
    --end) shift; touch /tmp/test.exit && exit ;;
    --help) shift; echo "
    --host, -h          Define Host URL
    --number, -n        Define the amount of clients to simulate
    --room, -r          Define Big Blue Button Room Number
    --head              Dont use Headless Mode
    --mac               Choose Mac as operating system
    --unix              Choose Unix as operating system
    --end               Stop all running simulated clients
    --help              See this help message
    " && exit  ;;
#    --b|-b) shift; BROWSER="$1" ;;
#    --m|-m) shift; NEWOBJ="$1" ;;
    --s|-s) shift; SLEEP="$1" ;;
    *)		echo "$0: Unrecognized option: $1" >&2; exit 1 ;;
  esac
  shift
done



if ! echo "$HOST" | grep -qE '^http://|^https://'; then
	HOST="http://${HOST}"
fi
#BROWSER="${BROWSER:-firefox}"
#NEWOBJ="${NEWOBJ:-tab}"
SLEEP="${SLEEP:-8}"

i=0
echo "$IP"
export HOST
export ROOM
export HEAD

cd bbb_test
rm -rf /tmp/test.exit

while [ $i != "$NUMBER" ]; do
	i=$[$i+1]

	echo "Connecting user $IP-$i"
  export JOIN_USER="${IP}-${i}"

  npm start &

	# We'll give BigBlueButton a moment to process the incoming request from this IP.
	# If we try to open 10 clients at the same time, the session IDs for each client will
	# likely not go to the specific tab (as thay all share the same IP address)
	sleep "$SLEEP"
done
echo
