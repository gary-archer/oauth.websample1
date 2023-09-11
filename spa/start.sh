#!/bin/bash

#################################################
# A script to build and run the SPA in watch mode
#################################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download dependencies
#
if [ ! -d 'node_modules' ]; then
  npm install
  if [ $? -ne 0 ]; then
    echo 'Problem encountered installing SPA dependencies'
    exit 1
  fi
fi

#
# Check code quality
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Problem encountered running SPA code quality checks'
  exit 1
fi

#
# Run the command to build and watch Javascript
#
npm start
if [ $? -ne 0 ]; then
  echo 'Problem encountered running the SPA'
  exit 1
fi

#
# Prevent automatic terminal closure
#
read -n 1
