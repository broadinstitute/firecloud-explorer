import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules, ExtraOptions } from '@angular/router';
import { LoginComponent } from '@app/file-manager';
import { FileExplorerComponent } from '@app/file-manager/file-explorer/file-explorer.component';
import { TransferablesGridComponent } from '@app/file-manager/transferables-grid/transferables-grid.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: './file-manager/file-manager.module#FileManagerModule',
  },
  {
    path: 'file-download',
    loadChildren: './file-manager/file-manager.module#FileManagerModule',
  },
  {
    path: 'file-upload',
    loadChildren: './file-manager/file-manager.module#FileManagerModule',
  },
  {
    path: 'status',
    loadChildren: './file-manager/file-manager.module#FileManagerModule',
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
        useHash: false,
        preloadingStrategy: PreloadAllModules,
        onSameUrlNavigation: 'reload',
        enableTracing: false
      }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
