import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent, LoginComponent } from '@app/file-manager';
import { FileExplorerComponent } from '@app/file-manager/file-explorer/file-explorer.component';
import { TransferablesGridComponent } from '@app/file-manager/transferables-grid/transferables-grid.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'file-download',
    component: FileExplorerComponent
  },
  {
    path: 'status',
    component: TransferablesGridComponent
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
