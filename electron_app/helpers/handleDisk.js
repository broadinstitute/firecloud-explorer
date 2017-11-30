const fs = require('fs');
const mkdirp = require('mkdirp');

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

module.exports = handleFolder;
