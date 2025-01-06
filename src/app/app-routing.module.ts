import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full'
  },
  {
    path: 'main',
    loadChildren: () => import('./components/main/main.module').then(m => m.MainModule)
  },
  {
    path: 'maintenance',
    loadChildren: () => import('./components/maintenance/maintenance.module').then(m => m.MaintenanceModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
