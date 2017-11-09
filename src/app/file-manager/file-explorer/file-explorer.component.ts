import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Message, TreeNode, MenuItem } from 'primeng/primeng';

import { HttpEventType, HttpResponse } from '@angular/common/http';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import * as Downloadables from '../actions/downloadables.actions';
import { Item } from '../models/item';
import { DownloadableState, DownloadablesReducer } from '../reducers/downloadables.reducer';

import { FilesService } from '../services/files.service';
import { FirecloudService } from '../services/firecloud.service';
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
  @Output('count') count: EventEmitter<any> = new EventEmitter();

  files: TreeNode[];
  workspaces: any[];

  selectedCount = 0;
  selectedFiles: TreeNode[] = [];
  selectedFile: TreeNode;

  folderCount = 0;
  fileCount = 0;
  fileSize = 0;

  archivos: TreeNode[];

  items: MenuItem[];
  cols: any[];

  constructor(private store: Store<AppState>,
    private filesService: FilesService,
    private gcsService: GcsService,
    private firecloudService: FirecloudService
  ) {

  }
  ngOnInit() {

    this.filesService.getBucketFiles(false).subscribe(
      resp => {
        resp.subscribe(r => {
          this.files = r;
        });
      }
    );

    this.cols = [
      { field: 'path', header: 'Name', footer: 'Name' },
      { field: 'size', header: 'Size', footer: 'Size' },
      { field: 'updated', header: 'Modified', footer: 'Modified' }
    ];

    this.items = [
      { label: 'View', icon: 'fa-search', command: (event) => this.viewNode(this.selectedFile) },
      { label: 'Delete', icon: 'fa-close', command: (event) => this.deleteNode(this.selectedFile) }
    ];
  }

  countFiles() {
    this.fileCount = 0;
    this.selectedFiles.forEach(f => {
      if (f.data.type === 'File') {
        this.fileCount++;
      }
    });
  }

  nodeSelect(event) {
    this.countFiles();
    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'Node Selected', detail: event.node.data.name });
  }

  nodeUnselect(event) {
    this.countFiles();
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
    this.countFiles();
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
    this.countFiles();
  }

  selectNone() {
    this.selectedFiles = [];
    this.countFiles();
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
    this.countFiles();
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

    this.selectedFiles
    .filter(file => file.data.type === 'File')
    .forEach(file => {
      const item = {
        id: file.data.id,
        name: file.data.path,
        size: file.data.size,
        created: file.data.updated,
        updated: file.data.updated,
        icon: file.data.type === 'Folder' ? 'folder' : 'cloud',
        selected: false
      };
      this.store.dispatch(new Downloadables.AddItem(item));
      this.done.emit(true);
    });
  }
}
