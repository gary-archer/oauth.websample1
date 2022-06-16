#!/bin/bash

#########################################################
# A script to build the API and run nodemon in watch mode
#########################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download dependencies
#
if [ ! -d 'node_modules' ]; then
  npm install
fi

#
# Check code quality
#
npm run lint

#
# On Linux ensure that you have first granted Node.js permissions to listen on port 80:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
npm start

#
# Prevent automatic terminal closure
#
read -n 1
