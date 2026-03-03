#!/bin/bash

#################################################
# A script to build and run the SPA in watch mode
#################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download dependencies
#
npm install
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing SPA dependencies'
  read -n 1
  exit 1
fi

#
# Check code quality
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Problem encountered running SPA code quality checks'
  read -n 1
  exit 1
fi

#
# Clear the build folder
#
rm -rf dist 2>/dev/null
mkdir dist
mkdir dist/spa

#
# Start the SPA
# On Linux ensure that you have first granted Node.js permissions to listen on port 443:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
npm start
if [ $? -ne 0 ]; then
  echo 'Problem encountered running the SPA'
  read -n 1
  exit 1
fi
