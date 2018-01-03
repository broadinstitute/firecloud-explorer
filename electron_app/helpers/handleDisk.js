const fs = require('fs');
const mkdirp = require('mkdirp');
const diskspace = require('diskspace');

let saveConditions = { enoughSpace: Boolean, allowed: Boolean };
let conditions = {error: false, errorMessage: ''};

const handleFolder = (directory) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(directory)) {

            mkdirp.sync(directory, (err) => {
                if (err) {
                    reject(err);
                }
            });
        }
        resolve(directory);
    });
};

const handleDiskSpace = (destination, totalFileSize) => {
    let drive = destination;
    conditions = {error: Boolean, errorMessage: String};    
    return new Promise((res) => {
        if (process.platform === 'win32') {
            drive = drive.slice(0, 1);
        }
        try{
        diskspace.check(drive, function (dskErr, diskSpace) {
            canWrite(destination, (wrtErr, isWritable) => {
                if(diskSpace.free<totalFileSize) {
                    conditions.error = true;
                    conditions.errorMessage = 'Sorry, there is not enough space on disk.';
                } else if (!isWritable){
                    conditions.error = true;
                    conditions.errorMessage = 'Sorry, you don\'t have the proper permissions to access that location.';
                }
                res(conditions);
            });
        })
    } catch(err) {
        rej(err);
    }
    });
};
const canWrite = (path, callback) => {
    fs.access(path, fs.W_OK, function (err) {
        callback(null, !err);
    });
}

module.exports = { handleFolder, handleDiskSpace }
