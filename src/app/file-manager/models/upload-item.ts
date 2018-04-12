import { Type } from './type';
import { EntityStatus } from './entity-status';

export class UploadItem {
  id: string;
  name: string;
  displayName: string;
  created: Date;
  updated: Date;
  size: number;
  path: string;
  preserveStructure: boolean;
  destination: string;
  progress: number;
  status: EntityStatus;
  transferred: number;
  remaining: number;
  bucketName: string;
  workspaceName: string;
  prefix: string;
  delimiter: string;
  selected: boolean;
  indeterminate: boolean;
  namespace: string;

  constructor(id, name, created, updated, size, path, destination,
    status, bucketName, prefix, delimiter, preserveStructure, workspaceName,
    displayName, namespace) {

    this.id = id;
    this.name = name;
    this.created = created;
    this.updated = updated;
    this.size = size;
    this.path = path;
    this.preserveStructure = preserveStructure;
    this.destination = destination;
    this.status = status;
    this.bucketName = bucketName;
    this.prefix = prefix;
    this.delimiter = delimiter;
    this.selected = false;
    this.indeterminate = false;
    this.workspaceName = workspaceName;
    this.displayName = displayName;
    this.setProgressData();
    this.namespace = namespace;
  }

  setProgressData() {
    this.transferred = 0;
    this.remaining = 0;
    this.progress = 0;
  }

}




// import { Type } from './type';
// import { ItemStatus } from './item-status';

// export class UploadItem {
//   id: string;
//   name: string;
//   displayName: string;
//   created: Date;
//   updated: Date;
//   size: number;
//   mediaLink: string;
//   path: string;
//   preserveStructure: boolean;
//   destination: string;
//   progress: number;
//   type: Type;
//   status: ItemStatus;
//   transferred: number;
//   remaining: number;
//   bucketName: string;
//   workspaceName: string;
//   prefix: string;
//   delimiter: string;
//   open: boolean;
//   selected: boolean;
//   indeterminate: boolean;
//   namespace: string;
//   children?: UploadItem[];
//   currentBatch: boolean;
//   istatus: number;
//   itype: number;

//   constructor(id, name, created, updated, size, mediaLink, path, destination,
//     type, status, bucketName, prefix, delimiter, preserveStructure, open,
//     workspaceName, displayName, namespace, currentBatch, itype, istatus) {

//     this.id = id;
//     this.name = name;
//     this.created = created;
//     this.updated = updated;
//     this.size = size;
//     this.mediaLink = mediaLink;
//     this.path = path;
//     this.preserveStructure = preserveStructure;
//     this.destination = destination;
//     this.type = type;
//     this.status = status;
//     this.bucketName = bucketName;
//     this.prefix = prefix;
//     this.delimiter = delimiter;
//     this.selected = false;
//     this.indeterminate = false;
//     this.open = open;
//     this.workspaceName = workspaceName;
//     this.displayName = displayName;
//     this.setProgressData();
//     this.namespace = namespace;
//     this.currentBatch = currentBatch;
//     this.istatus = itype;
//     this.itype = istatus;
//     this.children = [];

//   }

//   setProgressData() {
//     this.transferred = 0;
//     this.remaining = 0;
//     this.progress = 0;
//   }

//   /*
//   * This method verifies parent-child relationship
//   * between two items.
//   * Criteria is based on item.path.
//   */
//   isParentOf(child: UploadItem): boolean {

//     if (this.type === 'File') {
//       return false;
//     }

//     if (child === undefined) {
//       return false;
//     }

//     return child.path.startsWith(this.path);
//   }
// }

