#!/bin/bash

#########################################################
# A script to build the API and run nodemon in watch mode
#########################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
npm install

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
# On Linux we have to do this to listen on port 80
#
if [ "$PLATFORM" != 'LINUX' ]; then
    npm start
else
    sudo ./node_modules/.bin/ts-node --files ./src/host/startup/app.ts
fi
