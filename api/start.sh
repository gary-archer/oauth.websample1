#!/bin/bash

#########################################################
# A script to build the API and run nodemon in watch mode
#########################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
npm install

if [ "$(uname -s)" == 'Linux' ]; then

    # On Linux we must run the underlying command as root, in order to listen on ports below 1024
    sudo ./node_modules/.bin/ts-node --files ./src/host/startup/app.ts
    read -n 1

else

    # On Windows or macOS we just run the start command
    npm start
fi

