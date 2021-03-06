const fs = require('fs');
var tmp = require('tmp');
const mkdirp = require('mkdirp');
const diskspace = require('diskspace');
const electron = require('electron');
const userDataPath = (electron.app || electron.remote.app).getPath('userData');
let conditions = { error: false, errorMessage: '' };
const FILE_DOESNT_EXIST = -4058;
const FILE_ALREADY_EXISTS = -4048;
const handleFolder = (directory, callback) => {
    if (!fs.existsSync(directory)) {
        mkdirp.sync(directory, (err) => {
            if (err) {
                return callback(err);
            }
        });
    }
    return callback(directory);
};

const fileAlreadyExists = (file) => {
     if (process.platform === 'win32') {
        let filePath = file.split("\\").join("\\\\");
        return (exists(filePath) || exists(filePath.concat('.mtd')));
        

    } else {
        return (fs.existsSync(file) || fs.existsSync(file.concat('.mtd')));
    }       
};

const exists = (filePath) => {
    let result = false;
    try{
        fs.statSync(filePath);
        result = true;
    } catch(error) {
        if(!error.errno === FILE_DOESNT_EXIST || error.errno === FILE_ALREADY_EXISTS) {
            result = true;
        }
    } finally {
        return result;
    }
};

const handleDiskSpace = (destination, totalFileSize) => {
    destination = destination !== null ? destination : userDataPath;
    let drive = destination;
    conditions = { error: Boolean, errorMessage: String };
    return new Promise((res) => {
        if (process.platform === 'win32') {
            drive = drive.slice(0, 1);
        }
        try {
            diskspace.check(drive, function (dskErr, diskSpace) {
                if (diskSpace.free < totalFileSize) {
                    conditions.error = true;
                    conditions.errorMessage = 'Sorry, there is not enough space on disk.';
                    res(conditions);
                } else {
                    canWrite(destination, (wrtErr, isWritable) => {
                        if (!isWritable) {
                            conditions.error = true;
                            conditions.errorMessage = 'Sorry, you don\'t have the proper permissions to access that location.';
                        }                     
                        res(conditions);
                    });
                }
            });
        } catch (err) {
            rej(err);
        }
    });
};
const canWrite = (path, callback) => {
    if (process.platform === 'win32') {
        let temp = path + '/tmp-XXXXXX';
        tmp.dir({ template: temp }, function _tempDirCreated(err, path, cleanupCallback) {
            callback(null, !err);
            if (!err) cleanupCallback();
        });
    } else {
        fs.access(path, fs.W_OK, function (err) {
            callback(null, !err);
        });
    }
};

module.exports = { handleFolder, handleDiskSpace, fileAlreadyExists };