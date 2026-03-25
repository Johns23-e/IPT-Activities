import { Routes } from '@angular/router';
import { AppComponent } from './app';
import { Users } from './pages/admin/users/users';
import { AddUsers } from './pages/admin/add-users/add-users';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
  },
  {
    path: 'admin',
    component: Users,
  },
  {
    path: 'user',
    component: AddUsers,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
