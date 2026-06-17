import { Routes } from '@angular/router';
import { Cliente } from './components/cliente/cliente';
import { Home } from './components/home/home';
import { Mecanico } from './components/mecanico/mecanico';

export const routes: Routes = [
    {path: "", loadComponent : () => import('./components/home/home').then(m => m.Home)},
    {path: "home", loadComponent : () => import('./components/home/home').then(m => m.Home)},
    {path: "cliente", loadComponent : () => import('./components/cliente/cliente').then(m => m.Cliente)},
    {path: "mecanico", loadComponent : () => import('./components/mecanico/mecanico').then(m => m.Mecanico)}
];
