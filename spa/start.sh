#!/bin/bash

#######################################################
# A script to build the SPA using webpack in watch mode
#######################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download dependencies
#
if [ ! -d 'node_modules' ]; then
  npm install
fi

#
# Run the command to build and watch Javascript
#
npm start

#
# Prevent automatic terminal closure on Linux
#
if [ "$(uname -s)" == 'Linux' ]; then
  read -n 1
fi