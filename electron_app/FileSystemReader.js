const path = require('path');
const fs = require('fs');

const recursiveFileSystemReader = (dir, fileList = []) => {

  fs.readdirSync(dir).forEach(file => {
    let isDirectory = false;
    let isFile = false;

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    try {
      if (stat.isDirectory()) {
        isDirectory = true;
      } else if (stat.isFile()) {
        isFile = true;
      }
    } catch (err) {
      console.log(err);
    }

    if (isDirectory) {
      fileList.push({
        label: file,
        name: file,
        data: {
          name: file,
          path: path.join(dir, file),
          size: getSizeFromFolder(path.join(dir, file)),
          type: 'Folder',
          created: stat.birthTime,
          updated: stat.mtime
        },
        type: 'Folder',
        children: recursiveFileSystemReader(filePath)
      });
    }

    if (isFile) {
      fileList.push({
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
        type: 'File'
      });
    }
  });
  return fileList
}

const lazyFileSystemReader = (dir, fileList = []) => {

  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !file.startsWith('.')) {
      fileList.push({
        label: file,
        name: file,
        data: {
          name: file,
          path: path.join(dir, file),
          size: getSizeFromFolder(path.join(dir, file)),
          type: 'Folder',
          created: stat.birthTime,
          updated: stat.mtime
        },
        type: 'Folder',
        leaf: false
      });
    }
  });
  return fileList;
}

const lazyNodeReader = (dir, fileList = []) => {

  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    let node = {};
    try {
      const stat = fs.statSync(filePath);
      if (file.startsWith('.')) {
        // skip file
      } else if (stat.isDirectory()) {
        node = {
          label: file,
          name: file,
          data: {
            name: file,
            path: path.join(dir, file),
            size: getSizeFromFolder(path.join(dir, file)),
            type: 'Folder',
            created: stat.birthTime,
            updated: stat.mtime
          },
          type: 'Folder',
          leaf: false,
          selectable: false
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
          leaf: true,
          selectable: true
        };
        fileList.push(node);
      }
    } catch (e) {
      console.log('error reading file stats ', e);
    }
  });
  return fileList;
}

function getSizeFromFolder(dir) {
  const files = fs.readdirSync(dir);
  totalSize = 0;
  for (let file of files) {
    totalSize += fs.statSync(path.join(dir, file)).size;
  }
  return totalSize;
}

module.exports = {
  recursiveFileSystemReader,
  lazyFileSystemReader,
  lazyNodeReader
}
