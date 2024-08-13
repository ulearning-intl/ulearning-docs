#!/bin/bash

echo "--- ulearning-docs server starting ---"

echo "--- install dependencies ---"
npm install
npm install pm2 -g

echo "--- start build ---"
npm run build

echo "--- running ---"
pm2 delete ulearning-docs
pm2 start -n ulearning-docs npm -- run start
