#!/bin/bash

# cleaning Mac's build folder
rm -rf app/mac/*

# creating installer folder, otherwise fails 
mkdir -p app/mac/installers

# package the application as .app
./node_modules/.bin/electron-packager . --overwrite --asar --platform=darwin --arch=x64 --icon=src/assets/icons/mac/FCExplorer.icns --prune=true --out=app/mac/builds --app-bundle-id=org.broadinstitute.firecloud-explorer --app-copyright='Copyright © 2018 Broad Institute All Rights Reserved' --app-version='0.1.1' --app-category-type=public.app-category.medical

# Sign generated .app 
# <identity> is the hex id of imported certificate
#cd app/mac/builds/FireCloud DataShuttle-darwin-x64
codesign --deep --force --verbose --sign <identityId> app/mac/builds/FireCloud\ DataShuttle-darwin-x64/FireCloud\ DataShuttle.app


# create .dmg installer
./node_modules/.bin/electron-installer-dmg './app/mac/builds/FireCloud DataShuttle-darwin-x64/FireCloud DataShuttle.app' 'FireCloud DataShuttle' --out=app/mac/installers --overwrite --format=UDZO --icon=src/assets/icons/mac/FCExplorer.icns

