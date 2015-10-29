#!/bin/bash

sudo service homebridge stop
cd /home/pi/homebridge
git pull
npm install
sudo service homebridge start