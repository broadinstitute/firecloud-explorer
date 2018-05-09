# FireCloud DataShuttle Release Notes

### Alpha version 0.1.1
 
## Feature summary

This alpha release of FireCloud DataShuttle includes the following features:

* Browse and select files or folders associated with FireCloud workspaces.
* Export selection to a Google or Amazon S3 bucket that a user can write to.
* Monitor the status of transfers as they proceed.
* Fixed most of previous known issues.
 
## Known Issues

The following issues have been identified, but not resolved in this version:

* If there is no internet connection while trying to login the app, the “Choose account” Google popup will appear blank. 

_Temporary solution: the user should either restart the computer or end the app from the OS task manager._
 
* If during a Download or Upload process internet connection gets lost, the app will block and files “In Progress”, will remain with that status indefinitely.

_Temporary solution: the user should cancel the current transfer and retry when internet connection gets back._
 
* Previous transfers will remain listed in the Progress Status page even though a new user logs in the app.

_Temporary solution: to clean previous transfer information, the user will have to close the application first._
 
* If the user tries to export a 0 bytes file to an Amazon S3 bucket, that file will be listed in the Progress Status page as “In Progress” indefinitely, but the transfer will never occur.

_Temporary solution: the user should sign out or close the application and retry the operation skipping that empty file._
 
* If the user cancels an export to a Google or Amazon S3 bucket, “In Progress” files will not be canceled, they will continue to be transferred, but those that hasn’t been started will.

_Temporary solution: the user should sign out or close the application to terminate remaining “In Progress” transfers._
 
* While a transfer is in progress, pagination is not working as expected since files don’t remain in the same position.
 
* After cancelling an Upload, the destination bucket will have 3 more files than the amount stated on the Status Page.
 
## Have any questions?

Please visit: https://gatkforums.broadinstitute.org/firecloud/categories/fc-explorer


### Alpha version 0.1.0

## Feature summary

This first alpha release of FireCloud DataShuttle includes the following features:

* Login using FireCloud credentials.
* Browse and select files associated with FireCloud workspaces.
* Download selected files to the user’s local file system, optionally preserving the bucket folder structure.
* Upload selected files from the local file system to a FireCloud workspace that a user can write to.
* Monitor the status of uploads and download as they proceed.

## Known Issues

The following issues have been identified, but not resolved in this version:

* If there is no internet connection while trying to login the app, the “Choose account” Google popup will appear blank.

_Temporary solution:​ the user should wait for a few seconds and an alert message will appear notifying the issue, by clicking “Ok”, both Google popup and the
application will close._

* In Downloads page, if the user has access to a big amount of workspaces and files, it can take several minutes to load all that content and the system won’t display any loading indicator during that process.

_Temporary solution:​ the user will have to wait, without leaving that page, until the load finishes._

* In Uploads page, if the user selects a folder that is​ not expanded​, even though it will look checked, no content is actually selected.

_Temporary solution:​ in order to select the content of an entire folder to upload, please expand it first._

* If inside a workspace there are two files with the exact same name (in different folders) and the user tries to download them without preserving folder structure, the app will only download one of them and the other will always be shown  Progress Status page with “Downloading” status.

_Temporary solution:​ If there are files with the same name in a workspace, download them using the ​“Preserve folder structure”​ option._

* Completed downloads and uploads will remain listed in the Status page until the application is closed as well as the amount of files on top of the progress bar.

_Temporary solution:​ to clean the list of transfered files, the user will have to either sign out or quit the application._

* On Windows, if a user tries to download files into a folder which they don’t have write permissions, the files will be listed in the Status page as “Downloading” but that transfer will never occur.

_Temporary solution:​ if the app is running on Windows OS, and files aren’t downloading, the user should verify the access permissions of the chosen
download destination folder._

* On Windows, if a download is canceled, the temporary files will not be deleted until the application is closed.

_Temporary solution: ​if the app is running on Windows OS, the user should close and re-open the application after canceling a download or choose a different destination Folder to download them again._


## Have any questions?

Please visit: ​https://gatkforums.broadinstitute.org/firecloud/categories/fc-explorer