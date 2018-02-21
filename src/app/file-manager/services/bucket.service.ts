import { Injectable } from '@angular/core';
import { GcsService } from './gcs.service';
import { Item } from '../models/item';
import { Observable } from 'rxjs/Observable';
import { UUID } from 'angular2-uuid';
import { Type } from '@app/file-manager/models/type';

@Injectable()
export class BucketService {

  static delimiter: string;
  public isResponseComplete;
  constructor(private gcsService: GcsService) { }
  elements: Item[] = [];
  readonly DELIMITER = '/';

  public getBucketData(bucketName: String, delimiter: String, token: String, workspaceName: String): Observable<Item[]> {
    this.elements = [];
    this.isResponseComplete = false;
    return this.getBucketFiles(bucketName, token, workspaceName, delimiter);
  }

  getBucketFiles(bucketName, token, workspaceName, delimiter) {
    const prefix = !delimiter.endsWith(this.DELIMITER) ? delimiter + this.DELIMITER : delimiter;
    return this.gcsService.getBucketFilesWithMaxResult(bucketName, prefix, token)
      .map(response => {
        if (delimiter === BucketService.delimiter) {
          this.processBucketData(response, bucketName, workspaceName);
          if (response.nextPageToken !== undefined) {
              this.getBucketFiles(bucketName, response.nextPageToken, workspaceName, delimiter).subscribe(result => {
              return this.elements;
            });
          } else {
            this.isResponseComplete = true;
          }
        } else {
          this.elements = [];
        }
        return this.elements;
      });
  }

  private processBucketData(resp, bucketName, workspaceName): Item[] {
    if (resp.prefixes !== undefined) {
      resp.prefixes.forEach(prefix => {
        const currentName = this.getName(prefix);
        const id = bucketName + currentName;
        this.elements.push( new Item(id, currentName, null, null, NaN, '', '', '',
        'Folder', '', bucketName, workspaceName + this.DELIMITER + prefix, prefix, true, false, ''));
      });
    }
    if (resp.items !== undefined) {
      resp.items.forEach(item => {
        const path =  workspaceName + this.DELIMITER + item.name;
        const name = item.name.split(this.DELIMITER)[item.name.split(this.DELIMITER).length - 1];
        this.elements.push(new Item(item.id, name, item.created, item.updated, item.size, item.mediaLink, path, '',
        'File', '', bucketName, this.DELIMITER, this.DELIMITER, true, false, ''));
      });
    }
    return this.elements;
  }


  private getName(prefix): string {
    const prefixSegments = prefix.split(this.DELIMITER);
    return prefixSegments[prefixSegments.length - 2];
  }

  public getIsResponseComplete() {
    return this.isResponseComplete;
  }

}
