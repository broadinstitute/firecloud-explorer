import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TreeNode } from 'primeng/primeng';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class FilesService {
    files = {};
    isBottom = true;

    constructor(private http: HttpClient) { }

    getFiles() {
        return this.http.get<any>('assets/demo/files.json')
            .toPromise()
            .then(res => <TreeNode[]>res.data);
    }

    public getBucketFiles(): Observable<any> {
        const url = 'https://www.googleapis.com/storage/v1/b/consent-bucket/o';
        return this.http.get(url)
            .map((resp: any) => {
                let arbol: TreeNode[] = [];

                resp.items.forEach(item => {
                    this.isBottom = true;
                    arbol = [...this.processTree(arbol, item)];
                    const files = {};
                });
                return arbol;
            });
    };

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

    createNode(item: any, path: string): TreeNode {
        const node: TreeNode = {};
        node.data = {
            id: item.id,
            selfLink: item.selfLink,
            bucket: item.bucket,
            name: item.name,
            path: path,
            size: item.size,
            type: (<string>item.name).endsWith('/') ? 'Folder' : 'File',
            leaf: true
        };
        return node;
    }

}
