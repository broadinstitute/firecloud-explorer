import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { FileExplorerUploadComponent } from './file-explorer-upload/file-explorer-upload.component';
import { TransferablesGridComponent } from './transferables-grid/transferables-grid.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'file-download', component: FileExplorerComponent },
  { path: 'file-upload', component: FileExplorerUploadComponent },
  { path: 'file-export', component: FileExplorerComponent },
  { path: 'status', component: TransferablesGridComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileManagerRoutingModule { }
