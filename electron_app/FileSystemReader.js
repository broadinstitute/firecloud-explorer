const path = require('path');
const fs = require('fs');

const lazyNodeReader = (dir, fileList = []) => {

  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    let node = {};
    try {
      const stat = fs.statSync(filePath);
      if (!file.startsWith('.')) {
        if (stat.isDirectory()) {
          node = {
            label: file,
            name: file,
            data: {
              name: file,
              path: path.join(dir, file),
              size: '-',
              type: 'Folder',
              created: stat.birthTime,
              updated: stat.mtime
            },
            type: 'Folder',
            leaf: false
          };
          fileList.push(node);
        } else {
          node = {
            label: file,
            name: file,
            data: {
              name: file,
              path: path.join(dir, file),
              size: stat.size,
              type: 'File',
              created: stat.birthTime,
              updated: stat.mtime
            },
            type: 'File',
            leaf: true
          };
          fileList.push(node);
        }
      }
    } catch (e) {
      // do nothing
      // we should log this somewhere in the future 
    }
  });
  return fileList;
};

const recursiveNodeReader = (dir, fileList = []) => {
  fs.readdirSync(dir).forEach(file => {

    const filePath = path.join(dir, file);

    let node = {};
    try {
      const stat = fs.statSync(filePath);

      if (!file.startsWith('.') && stat.isDirectory()) {
        recursiveNodeReader(filePath, fileList);
      } else {
        node = {
          name: file,
          path: path.join(dir, file),
          size: stat.size,
        };
        fileList.push(node);
      }
    } catch (e) {
      // do nothing
      // we should log this somewhere in the future 
    }
  });
  return fileList;
};

function getSizeFromFolder(dir) {
  const files = fs.readdirSync(dir);
  totalSize = 0;
  for (let file of files) {
    totalSize += fs.statSync(path.join(dir, file)).size;
  }
  return totalSize;
}

module.exports = {
  lazyNodeReader,
  recursiveNodeReader
}
