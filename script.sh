#!/bin/sh

echo "Install Packages ..." && npm install
echo "Build app ..." && npm run build
echo "Start app ..." && npm start
