import { Routes } from '@angular/router';
import { OrganizacionList } from './organizacion-list/organizacion-list';
import { UsuarioList } from './usuario-list/usuario-list';
import { OrganizacionDetail } from './organizacion-detail/organizacion-detail';

export const routes: Routes = [
  { path: '', component: OrganizacionList },
  { path: 'usuarios', component: UsuarioList },
  { path: 'organizaciones/:id', component: OrganizacionDetail },
];