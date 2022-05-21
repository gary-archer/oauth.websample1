#!/bin/bash

#########################################################
# A script to build the API and run nodemon in watch mode
#########################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
npm install

#
# On Linux ensure that you have first granted Node.js permissions to listen on port 80:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
npm start

#
# Prevent automatic terminal closure on Linux
#
if [ "$(uname -s)" == 'Linux' ]; then
  read -n 1
fi