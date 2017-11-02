import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Message, TreeNode, MenuItem } from 'primeng/primeng';

import { HttpEventType, HttpResponse } from '@angular/common/http';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import * as Downloadables from '../actions/downloadables.actions';
import { Item } from '../models/item';
import { DownloadableState, DownloadablesReducer } from '../reducers/downloadables.reducer';

import { FilesService } from '../services/files.service';
import { GcsService } from '../services/gcs.service';

interface AppState {
  downloadables: DownloadableState;
}
@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.css']
})
export class FileExplorerComponent implements OnInit {
  msgs: Message[];

  @Output('done') done: EventEmitter<any> = new EventEmitter();

  // files: Observable<TreeNode[]>;
  files: TreeNode[];
  workspaces: any[];

  selectedFiles: TreeNode[];
  selectedFile: TreeNode;

  fileCount = 0;
  fileSize = 0;

  archivos: TreeNode[];

  items: MenuItem[];
  cols: any[];

  constructor(private store: Store<AppState>,
    private filesService: FilesService,
    private gcsService: GcsService
  ) {

  }
  ngOnInit() {

    // this.files = this.gcsService.getBucketFiles();

    // this.filesService.getWorkspaces(false)
    //   .subscribe(
    //   event => {

    //     if (event.type === HttpEventType.Sent) {
    //       console.log("Request Sent ...");
    //     }
    //     if (event.type === HttpEventType.ResponseHeader) {
    //       console.log("Response Headers received ...");
    //     }

    //     if (event.type === HttpEventType.UploadProgress) {
    //       // This is an upload progress event. Compute and show the % done:
    //       const percentDone = Math.round(100 * event.loaded / event.total);
    //       console.log(`File is ${percentDone}% uploaded.`);
    //     }

    //     if (event.type === HttpEventType.DownloadProgress) {
    //       // This is an upload progress event. Compute and show the % done:
    //       const percentDone = Math.round(100 * event.loaded / event.total);
    //       console.log(JSON.stringify(event));
    //       console.log(`File is ${percentDone}% downloaded.`);
    //     }

    //     if (event instanceof HttpResponse) {
    //       console.log('File is completely uploaded!');
    //       this.workspaces = event.body;
    //     }
    //   },
    //   error => {
    //     console.log("-----------------> " + JSON.stringify(error));
    //   });

    this.filesService.getBucketFiles().subscribe(
      resp => {
        this.files = resp;
      }
    );

    this.cols = [
      { field: 'path', header: 'Path', footer: 'Path' },
      { field: 'name', header: 'Name', footer: 'Name' },
      { field: 'size', header: 'Size', footer: 'Size' },
      { field: 'type', header: 'Type', footer: 'Type' }
    ];

    this.items = [
      { label: 'View', icon: 'fa-search', command: (event) => this.viewNode(this.selectedFile) },
      { label: 'Delete', icon: 'fa-close', command: (event) => this.deleteNode(this.selectedFile) }
    ];
  }

  nodeSelect(event) {
    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'Node Selected', detail: event.node.data.name });
  }

  nodeUnselect(event) {
    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'Node Unselected', detail: event.node.data.name });
  }

  nodeExpand(event) {
    if (event.node) {
    }
  }

  viewNode(node: TreeNode) {
    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'Node Selected', detail: node.data.name });
  }

  deleteNode(node: TreeNode) {
    node.parent.children = node.parent.children.filter(n => n.data !== node.data);
    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'Node Deleted', detail: node.data.name });
  }

  expandAll() {
    this.files.forEach(node => {
      this.expandRecursive(node, true);
    });
  }

  collapseAll() {
    this.files.forEach(node => {
      this.expandRecursive(node, false);
    });
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }

  selectAll() {
    this.selectedFiles = [];
    this.files.forEach(node => {
      this.selectRecursive(node, true);
    });
  }

  selectNone() {
    this.selectedFiles = [];
  }

  toggleSelection() {
    const newSelection = [];
    this.files.forEach(x => {
      if (this.selectedFiles.includes(x)) {
        // do nothing
      } else {
        newSelection.push(x);
      }
    });
    this.selectedFiles = newSelection;
  }

  private selectRecursive(node: TreeNode, isExpand: boolean) {
    this.selectedFiles = [...this.selectedFiles, node];
    if (node.children) {
      node.children.forEach(childNode => {
        this.selectRecursive(childNode, isExpand);
      });
    }
  }

  selectionDone() {
    this.selectedFiles.forEach(file => {
      const item = {
        id: file.data.id,
        name: file.data.name,
        size: file.data.size,
        updated: new Date('1/1/16'),
        icon: file.data.type === 'Folder' ? 'folder' : 'cloud',
        selected: false
      };
      this.store.dispatch(new Downloadables.AddItem(item));
      this.done.emit(true);
    });
  }
}
