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
# Serve the SPA code with hot reloading
#
npx vite
if [ $? -ne 0 ]; then
  echo 'Problem encountered building SPA static content'
  read -n 1
  exit 1
fi

#
# Prevent automatic terminal closure
#
read -n 1
