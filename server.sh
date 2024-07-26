#!/bin/bash

echo "--- ulearning-docs server starting ---"

echo "--- install dependencies ---"
npm ci

echo "--- start build ---"
npm run build

echo "--- running ---"
npm install pm2 -g
pm2 delete ulearning-docs
pm2 start -n ulearning-docs npm -- run start
