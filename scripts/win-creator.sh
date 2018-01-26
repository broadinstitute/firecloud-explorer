#!/bin/bash

#npm install -g electron-packager electron-winstaller

# cleaning Windows's build folder
rm -rf app/windows/*

# creating installer folder, otherwise fails 
mkdir -p app/windows/installers

# package the application as .app
./node_modules/.bin/electron-packager . --overwrite --asar --platform=win32 --arch=x64 --icon=src/assets/icons/win/firecloud-explorer.ico --prune=true --out=app/windows/builds --app-copyright='Copyright © 2018 Broad Institute All Rights Reserved'

# create windows installer
node installers/windows/createinstaller.js
