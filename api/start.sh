#!/bin/bash

####################################################
# A script to build the API and run it in watch mode
####################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download dependencies
#
npm install
if [ $? -ne 0 ]; then
  echo 'Problem encountered installing API dependencies'
  read -n 1
  exit 1
fi

#
# Check code quality
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Problem encountered running API code quality checks'
  read -n 1
  exit 1
fi

#
# On Linux ensure that you have first granted Node.js permissions to listen on port 80:
# - sudo setcap 'cap_net_bind_service=+ep' $(which node)
#
npm start
if [ $? -ne 0 ]; then
  echo 'Problem encountered running the API'
  read -n 1
  exit 1
fi

#
# Prevent automatic terminal closure
#
read -n 1
