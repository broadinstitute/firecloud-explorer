import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TreeNode } from 'primeng/primeng';
import { environment } from '@env/environment';
import { GcsService } from './gcs.service';
import { Observable } from 'rxjs/Rx';
import { FirecloudService } from './firecloud.service';
import { FileData } from '../models/filedata';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class FilesService {
    files = {};
    isBottom = true;

    constructor(private gcsService: GcsService, private firecloudService: FirecloudService) { }

    public getBucketFiles(isWorkspacePublic: boolean): Observable<Observable<TreeNode[]>> {
        return this.firecloudService.getUserFirecloudWorkspaces(isWorkspacePublic).map(
            resp => {
             if (resp != null && resp.length > 0) {
                const result: TreeNode[] = [];
                const observables: Observable<any>[] = [];
                const workspacesNameMap: Map<string, string> = new Map<string, string>();

                resp.forEach(workspace => {
                    workspacesNameMap.set(workspace.bucketName, workspace.name);
                    observables.push(this.gcsService.getBucketFiles(workspace.bucketName));
                });

                const rootTree: TreeNode[] = [];
                return this.processBucketContent(observables, rootTree, workspacesNameMap);
             }
          });
    }

    private processTree(arbol: TreeNode[], item: any): TreeNode[] {
        const path: string = 'root/' + item.name;
        const paths: string[] = path.split('/');
        return this.controlTree(arbol, item, path);
    }

    private controlTree(tree: TreeNode[], item: any, path: any): TreeNode[] {
        let testNode: TreeNode[] = [];
        if (!(path instanceof Array)) {
            path = path.split('/');
            path.splice(0, 1);
        }

        if (tree.length === 0) {
            tree.push(this.createNode(item, path[0]));
            return tree;
        }

        testNode = this.recursiveTree(tree, item, path);
        return testNode;
    }

    private recursiveTree(node: TreeNode[], item: any, path: any): TreeNode[] {
        let i = 0;

        if (node !== undefined) {
            while (i < node.length) {
                if (node[i].data.path === path[0] && 1 < path.length) {
                    path.splice(0, 1);
                    node[i] = this.defineChildren(node[i]);
                    this.recursiveTree(node[i].children, item, path);
                }
                i++;
            }
        }

        if (this.isBottom) {
            node.push(this.createNode(item, path[0]));
            this.isBottom = false;
        }

        return node;
    }

    private defineChildren(node: TreeNode): TreeNode {
        if (node.children === undefined) {
            node.children = [];
        }
        return node;
    }

    private createNode(item: any, path: string): TreeNode {
        const node: TreeNode = {};
        const fileData: FileData = {
            id: item.id,
            selfLink: item.selfLink,
            bucket: item.bucket,
            created: item.timeCreated,
            updated: item.updated,
            path: path,
            size: item.size + ' MB',
            type: (<string>item.name).endsWith('/') ? 'Folder' : 'File',
            leaf: true
        };

        node.data = fileData ;
        return node;
    }


    private initializeContentBucket(contentBucket, workspaceName): TreeNode {
        contentBucket.data = {
            path: workspaceName,
            leaf: true
        };
        const item = {name: '', id: '', selfLink: '/', bucket: '', path: '/', size: ''};
        return this.createNode(item, '/');
    }

    private processBucketContent(observables: Observable<any>[], rootTree: TreeNode[], workspacesMap: Map<string, string>) {
      return Observable.forkJoin(observables)
        .map((results: any) => {
         results.forEach(bucket => {
            if (bucket.items !== undefined) {
                const contentBucket: TreeNode = {};
                let filesBucket: TreeNode[] = [];
                const bucketName = bucket.items[0].bucket;
                const workspaceName = workspacesMap.get(bucketName);
                bucket.items.forEach(item => {
                    this.isBottom = true;
                    filesBucket = [...this.processTree(filesBucket, item)];
                });
                contentBucket.children = [...filesBucket];
                this.initializeContentBucket(contentBucket, workspaceName);
                rootTree.push(contentBucket);
            }
        });
        return rootTree;
      });
    }
}
