#/bin/bash

#########################################################
# A script to build the API and run nodemon in watch mode
#########################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
npm install
npm start