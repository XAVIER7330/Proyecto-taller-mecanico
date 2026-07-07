import { Routes } from '@angular/router';
import { Cliente } from './components/cliente/cliente';
import { Home } from './components/home/home';
import { Mecanico } from './components/mecanico/mecanico';
import { Login } from './components/login/login';
import { authGuard } from './shared/helpers/guards/auth-guard';
import { Roles } from './shared/interfaces/roles';
import { loginGuard } from './shared/helpers/guards/login-guard';

export const routes: Routes = [
    {path: "", redirectTo: "/home", pathMatch: "full"},
    {path: "login", loadComponent : () => import('./components/login/login').then(m => m.Login)},
    {path: "changePassw", canActivate: [authGuard],data: { roles: [Roles.Cliente, Roles.Oficinista, Roles.Mecanico, Roles.Admin] }, loadComponent : () => import('./components/change-passw/change-passw').then(m => m.ChangePassw)},
    {path: "home", canActivate: [authGuard], data: { roles: [Roles.Cliente, Roles.Oficinista, Roles.Mecanico, Roles.Admin] }, loadComponent : () => import('./components/home/home').then(m => m.Home)},
    {path: "cliente", canActivate: [authGuard], data: { roles: [Roles.Cliente, Roles.Oficinista, Roles.Admin] }, loadComponent : () => import('./components/cliente/cliente').then(m => m.Cliente)},
    {path: "mecanico", canActivate: [authGuard], data: { roles: [Roles.Oficinista, Roles.Admin] }, loadComponent : () => import('./components/mecanico/mecanico').then(m => m.Mecanico)},
    {path: "vehiculo", canActivate: [authGuard], data: { roles: [Roles.Oficinista, Roles.Admin] }, loadComponent : () => import('./components/vehiculo/vehiculo').then(m => m.Vehiculo)},
    {path: "admin", canActivate: [authGuard], data: { roles: [Roles.Admin] }, loadComponent : () => import('./components/admin/admin').then(m => m.Admin)},
    {path: "oficinista", canActivate: [authGuard], data: { roles: [Roles.Admin] }, loadComponent : () => import('./components/oficinista/oficinista').then(m => m.Oficinista)},
    {path: "servicio", canActivate: [authGuard], data: { roles: [Roles.Oficinista, Roles.Admin, Roles.Mecanico] }, loadComponent : () => import('./components/orden/orden').then(m => m.Orden)},
    {path: "error403", loadComponent : () => import('./components/error403/error403').then(m => m.Error403)}
];
