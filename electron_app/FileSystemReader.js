const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const {
  URL
} = require('url');
const rootUrl = new URL('file:///');

const recursiveFileSystemReader = (dir, fileList = []) => {

  fs.readdirSync(dir).forEach(file => {
    let isDirectory = false;
    let isFile = false;

    const filePath = path.join(dir, file);

    try {
      if (fs.statSync(filePath).isDirectory()) {
        isDirectory = true;
      } else if (fs.statSync(filePath).isFile()) {
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
          size: fs.statSync(path.join(dir, file)).size,
          type: 'Folder', 
          created: fs.statSync(path.join(dir, file)).birthTime,
          updated: fs.statSync(path.join(dir, file)).mtime
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
          size: fs.statSync(path.join(dir, file)).size,
          type: 'File', 
          created: fs.statSync(path.join(dir, file)).birthTime,
          updated: fs.statSync(path.join(dir, file)).mtime
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

    if (fs.statSync(filePath).isDirectory() && !file.startsWith('.')) {
      fileList.push({
        label: file,
        name: file,
        data: {
          name: file,
          path: path.join(dir, file),
          size: fs.statSync(path.join(dir, file)).size,
          type: 'Folder', 
          created: fs.statSync(path.join(dir, file)).birthTime,
          updated: fs.statSync(path.join(dir, file)).mtime,
          otro: 'si'
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
    if (fs.statSync(filePath).isDirectory()) {
      node = {
        label: file,
        name: file,
        data: {
          name: file,
          path: path.join(dir, file),
          size: fs.statSync(path.join(dir, file)).size,
          type: 'Folder', 
          created: fs.statSync(path.join(dir, file)).birthTime,
          updated: fs.statSync(path.join(dir, file)).mtime
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
          size: fs.statSync(path.join(dir, file)).size,
          type: 'File',
          created: fs.statSync(path.join(dir, file)).birthTime,
          updated: fs.statSync(path.join(dir, file)).mtime
        },
        type: 'File',
        leaf: true
      };
      fileList.push(node);
    }
  });
  return fileList;
}

module.exports = {
  recursiveFileSystemReader,
  lazyFileSystemReader,
  lazyNodeReader
}
