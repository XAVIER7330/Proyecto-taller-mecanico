import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Cliente } from './components/cliente/cliente';
import { Login } from './components/login/login';
import { AuthService } from './shared/services/auth.service';
import { Roles } from './shared/interfaces/roles';

const ROL_LABELS: Record<number, string> = {
  [Roles.Admin]: 'Administrador',
  [Roles.Oficinista]: 'Recepcionista',
  [Roles.Mecanico]: 'Mecánico',
  [Roles.Cliente]: 'Cliente'
};

type MenuItem = {
    label: string;
    icon: string;
    route: string;
    rol : number[];
} 

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterModule, 
    MatToolbarModule,     MatMenuModule,
    MatSidenavContainer,  MatSidenavModule,
    MatCheckboxModule, MatFormFieldModule,
    MatIconModule, MatDividerModule, MatListModule,
    MatTableModule, MatTooltipModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('frontend');
  protected readonly authService = inject(AuthService);
  menuItems = signal<MenuItem[]>([
    { label: 'Inicio', icon: 'home', route: 'home', rol : [1,2,3,4] },
    { label: 'Clientes', icon: 'people', route: 'cliente', rol : [1,2,4] }, //eliminar el 4 es solo para pruebaas
    { label: 'Mecanicos', icon: 'engineering', route: 'mecanico', rol : [1,2] },
    { label: 'Vehículos', icon: 'directions_car', route: 'vehiculo', rol : [1,2] },
    { label: 'Servicios', icon: 'build', route: 'servicio', rol : [1,2,3] },
    { label: 'Administradores', icon: 'admin_panel_settings', route: 'admin', rol : [1] },
    { label: 'Recepcionistas', icon: 'support_agent', route: 'oficinista', rol : [1] }
  ]) ;

  rolLabel(): string {
    return ROL_LABELS[this.authService.userActualS().rol] ?? '';
  }

  @HostListener('window:beforeunload')
  unloadHandler() {
    this.logout();
  }

  logout() {
    this.authService.logout();
  }
}
