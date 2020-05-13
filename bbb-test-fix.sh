#!/usr/bin/env bash

IP="$(hostname -I | cut -f1 -d ' ')"



while [ -n "$1" ]; do
  case $1 in
    --x|-x) set -x ;;
    --h|-h) shift; HOST="$1" ;;
    --n|-n) shift; NUMBER="$1" ;;
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
ROOM="chr-fhm-ffk"

i=0
export HOST
export ROOM
cd bbb_test
rm -rf /tmp/test.exit

while [ $i != "$NUMBER" ]; do
	i=$[$i+1]

	echo "Connecting user $IP-$i"
  export JOIN_USER="${IP}-${i}"
  
  if [ $i == "$NUMBER" ]
  then
    export NO_HEADLESS=true
  fi

  npm start &
	
	# We'll give BigBlueButton a moment to process the incoming request from this IP.  
	# If we try to open 10 clients at the same time, the session IDs for each client will
	# likely not go to the specific tab (as thay all share the same IP address)
	sleep "$SLEEP"
done
echo
