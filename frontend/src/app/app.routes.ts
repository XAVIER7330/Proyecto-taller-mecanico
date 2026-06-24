import { Routes } from '@angular/router';
import { Cliente } from './components/cliente/cliente';
import { Home } from './components/home/home';
import { Mecanico } from './components/mecanico/mecanico';
import { Login } from './components/login/login';
import { authGuard } from './shared/helpers/guards/auth-guard';
import { Roles } from './shared/interfaces/roles';

export const routes: Routes = [
    {path: "", redirectTo: "/home", pathMatch: "full"},
    {path: "login", loadComponent : () => import('./components/login/login').then(m => m.Login)},
    {path: "home", canActivate: [authGuard], data: { roles: [Roles.Cliente, Roles.Oficinista, Roles.Mecanico, Roles.Admin] }, loadComponent : () => import('./components/home/home').then(m => m.Home)},
    {path: "cliente", canActivate: [authGuard], data: { roles: [Roles.Cliente, Roles.Oficinista, Roles.Admin] }, loadComponent : () => import('./components/cliente/cliente').then(m => m.Cliente)},
    {path: "mecanico", canActivate: [authGuard], data: { roles: [Roles.Mecanico, Roles.Admin] }, loadComponent : () => import('./components/mecanico/mecanico').then(m => m.Mecanico)},
    {path: "error403", loadComponent : () => import('./components/error403/error403').then(m => m.Error403)}
];
