# FireCloud DataShuttle

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.5

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Running as an Electron app

`npm install`

`npm run build`

`npm run electron`

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Packaging 

### Note regarding packaging
Currently it is not possible to build Mac packages under other OS than Mac OS's. 
It is recommended to build Windows packages under Windows OS, even if could be done
under Linux with Wine. 

Due to incompatibilities with Windows OS, electron-installer-debian is not specified in package.json. It will be automated in next versions. Meanwhile, please install it by 
hand (npm install --save-dev electron-installer-debian) before creating Linux packages.

### Common steps
Before creating installable packages, regardless of OS, some steps must be performed:

`npm install` 

`npm run build`

Then, a package can be build for each OS.

### Mac OS packaging
Before running the script, a certificate for signing the app should have been imported and the script should have been edited to add certificate ID. 

This script needs to be run in a Mac OS instance:

`./scripts/mac-creator.sh `

Resulting .dmg file will be located in app/mac/installers.

### Windows OS packaging
Before running the script, a certificate file should be placed in a accessible place and the script should reflect where certificate is. 

This script needs to be run in a Windows OS instance. We have tested running under git-bash (we have it anyway since git for windows was installed first) :

`./scripts/win-creator.sh `

Resulting .dmg file will be located in app/windows/installers.

### Linux (debian) packaging
First, ensure electron-installer-debian is installed locally:

`npm install --save-dev electron-installer-debian`

This script needs to be run in a Linux OS instance:

`./scripts/linux-creator.sh `

Resulting .dmg file will be located in app/linux/installers.
