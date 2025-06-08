#!/bin/bash

#########################################################################################################
# A script to spin up the code sample, to be run from a terminal
# Open source libraries are useed by the SPA and API, with AWS Cognito as the default Authorization Server
#########################################################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Get the platform
#
case "$(uname -s)" in

  Darwin)
    PLATFORM="MACOS"
 	;;

  MINGW64*)
    PLATFORM="WINDOWS"
	;;

  Linux)
    PLATFORM="LINUX"
	;;
esac

#
# Run the SPA and API
#
if [ "$PLATFORM" == 'MACOS' ]; then

  open -a Terminal ./spa/start.sh
  open -a Terminal ./api/start.sh

elif [ "$PLATFORM" == 'WINDOWS' ]; then

  GIT_BASH="C:\Program Files\Git\git-bash.exe"
  "$GIT_BASH" -c ./spa/start.sh &
  "$GIT_BASH" -c ./api/start.sh &

elif [ "$PLATFORM" == 'LINUX' ]; then

  gnome-terminal -- ./spa/start.sh
  gnome-terminal -- ./api/start.sh
fi

#
# Set URLs to wait for
#
SPA_URL='http://localhost/spa'
API_URL='http://api.authsamples-dev.com/api'

#
# Wait for the API to come up
#
echo "Waiting for API to become available ..."
while [ "$(curl -k -s -o /dev/null -w ''%{http_code}'' "$API_URL/companies")" != "401" ]; do
  sleep 2
done

#
# Wait for the SPA's Javascript bundles to be built
#
echo "Waiting for SPA to become available ..."
SPA_BUNDLE='./spa/dist/app.bundle.js'
while [ ! -f "$SPA_BUNDLE" ]; do
  sleep 2
done

#
# Run the SPA in the default browser, then sign in with these credentials:
# - guestuser@example.com
# - Password1
#
if [ "$PLATFORM" == 'MACOS' ]; then
  open "$SPA_URL"
elif [ "$PLATFORM" == 'WINDOWS' ]; then
  start "$SPA_URL"
elif [ "$PLATFORM" == 'LINUX' ]; then
  xdg-open "$SPA_URL"
fi
