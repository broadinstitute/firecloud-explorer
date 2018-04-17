#!/bin/bash

# cleaning Linux's build folder
rm -rf app/linux/*

# creating installer folder, otherwise fails 
mkdir -p app/linux/installers

# package the application as .app
./node_modules/.bin/electron-packager . --overwrite --asar --platform=linux --arch=x64 --icon=src/assets/icons/png/1024x1024.png --prune=true --out=app/linux/builds --app-copyright='Copyright © 2018 Broad Institute All Rights Reserved' --app-version='0.1.0'

# create .deb installer
./node_modules/.bin/electron-installer-debian --src 'app/linux/builds/FireCloud DataShuttle-linux-x64/' --arch amd64 --config installers/linux/debian.json
