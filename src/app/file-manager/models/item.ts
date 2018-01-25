import { Type } from './type';
import { ItemStatus } from './item-status';
import { UUID } from 'angular2-uuid';

export class Item {
  id: string;
  name: string;
  created: Date;
  updated: Date;
  size: number;
  selected: boolean;
  mediaLink: string;
  path: string;
  preserveStructure: boolean;
  destination: string;
  progress: number;
  type: Type;
  status: ItemStatus;
  transferred: number;
  remaining: number;
  bucketName: string;
  prefix: string;
  delimiter: string;
  open: boolean;

  constructor(id, name, created, updated, size, mediaLink, path, destination,
              type, status, bucketName, prefix, delimiter, preserveStructure, open) {
    this.id = id;
    this.name = name;
    this.created = created;
    this.updated = updated;
    this.size = size;
    this.mediaLink = mediaLink;
    this.path = path;
    this.preserveStructure = preserveStructure;
    this.destination = destination;
    this.type = type;
    this.status = status;
    this.bucketName = bucketName;
    this.prefix = prefix;
    this.delimiter = delimiter;
    this.selected = false;
    this.open = open;
    this.setProgressData();
    }

  setProgressData() {
    this.transferred = 0;
    this.remaining = 0;
    this.progress = 0;
  }
}

