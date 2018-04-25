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
