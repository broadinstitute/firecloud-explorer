import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

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
    path: 'file-export',
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
