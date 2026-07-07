import { AfterViewInit, Component, signal, viewChild, inject } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { AdminService } from '../../shared/services/admin.service';

import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FrmAdmin } from '../forms/frm-admin/frm-admin';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { MatFabButton } from '@angular/material/button';
import { PrintService } from '../../shared/services/print-service';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormField, form } from '@angular/forms/signals';

import { TipoAdmin } from '../../shared/interfaces/tipo-admin';

type FilterForm = {
  cedula : string,
  nombre : string
}

@Component({
  selector: 'app-admin',
  imports: [MatCardModule, MatTableModule, MatIconModule, MatPaginatorModule,
            MatDialogModule, MatFabButton, MatExpansionModule, MatFormFieldModule, MatInput, FormField
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements AfterViewInit {
  mostrarEncabezados: string[] = ['cedula', 'nombre', 'email', 'botonera']

  dataSource = signal(new MatTableDataSource<TipoAdmin>());

  private readonly adminSrv = inject(AdminService);
  readonly dialog = inject(MatDialog);
  private readonly srvPrint = inject(PrintService);

  paginator = viewChild(MatPaginator);
  arregloAdmins: any = [];
  filtro : any;
  totalRecords = signal<number>(0);
  pageIndex = signal<number>(0);
  pageSize = signal<number>(5);
  public panelFilterState = signal(false);

  objFilter = signal<FilterForm>({
    cedula : '',
    nombre : ''
  });

  frmFilter = form(this.objFilter, (s) => {
    s.cedula;
    s.nombre;
  });

  public mostrarDialogo(titulo: string, datos? : TipoAdmin, info? : boolean) {
    const dialogRef = this.dialog.open(FrmAdmin, {
      width: '50vw',
      maxWidth: '35rem',
      data: {
        title: titulo,
        data: datos,
        info: info
      },
      disableClose : true
    });
    dialogRef.afterClosed()
      .subscribe({
        complete: () => {
          this.resetFiltro();
        }
      });

  } //Fin de mostrarDialogo

  onCedulaChange(event : Event) {
    this.filtro.cedula = (event.target as HTMLInputElement).value;
    this.filtrar();
  }
  onNombreChange(event : Event) {
    this.filtro.nombre = (event.target as HTMLInputElement).value;
    this.filtrar();
  }
  onFilterClose() {
    this.resetFiltro();
    this.frmFilter().reset({cedula: '', nombre:''});
  }
  onCreate() {
    this.mostrarDialogo('Nuevo Administrador');
  }

  onInfo(id : number) {
    this.adminSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.mostrarDialogo('Información de Administrador ', data, true);
        }
      });
  }
  onEdit(id : number) {
    this.adminSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.mostrarDialogo('Modificar Administrador ', data);
        }
      });
  }
  onResetPassw(cedula: string) {
    const dialogRef = this.dialog.open(DialogoGeneral,{
      data : {
        texto: '¿Restablecer la contraseña de este usuario?',
        icono : 'question_mark',
        textoAceptar : ' Si ',
        textoCancelar : ' No '
      }
    });

    dialogRef.afterClosed()
      .subscribe((res) => {
        if (res === true) {
            this.adminSrv.resetPassw(cedula)
              .subscribe({
                complete: () => {
                  this.dialog.open(DialogoGeneral,{
                    data : {
                      texto: 'Contraseña reestablecida',
                      icono : 'info',
                      textoAceptar : ' Aceptar '
                    }
                  });
                }
              });
        }
    });
  } //Fin de onResetPassw

  onDelete(idAdmin : number) {
    const dialogRef = this.dialog.open(DialogoGeneral,{
      data : {
        texto: '¿Eliminar registro seleccionado?',
        icono : 'question_mark',
        textoAceptar : ' Si ',
        textoCancelar : ' No '
      }
    });

    dialogRef.afterClosed()
      .subscribe((res) => {
        if (res === true) {
            this.adminSrv.delete(idAdmin)
              .subscribe({
                complete: () => {
                  this.resetFiltro();
                  this.dialog.open(DialogoGeneral,{
                    data : {
                      texto: 'Registro eliminado corrctamente',
                      icono : 'info',
                      textoAceptar : ' Aceptar '
                    }
                  });
                }
              });
        }
    });
  } //Fin de onDelete

  filtroInicial() {
    this.adminSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (data) => {
          this.arregloAdmins = data['data'];
          this.totalRecords.set(data['totalRegistros']);
          this.dataSource.set(new MatTableDataSource<TipoAdmin>(this.arregloAdmins));
        },
        complete: () => {
          this.dataSource().paginator = this.paginator();
        }
      })
  }

  filtrar() {
    this.adminSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (data) => {
          this.arregloAdmins = data['data'];
          this.totalRecords.set(data['totalRegistros']);
          this.dataSource.set(new MatTableDataSource<TipoAdmin>(this.arregloAdmins));
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.filtrar();
  }
  onPrint() {
    const columna = ['Cédula', 'Nombre', 'Correo'];
    this.adminSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (res) => {
          const cuerpo = Object(res['data']).map((fila : any) => {
              const datos = [
                fila.cedula,
                fila.nombre,
                fila.email
              ];
              return datos;
          });
          this.srvPrint.print(columna, cuerpo, 'Listado de Administradores', false)
        },
      });
  }

  resetFiltro() {
    this.filtro = {cedula : '', nombre : ''};
    this.filtroInicial();
  }

  ngAfterViewInit(): void {
    this.resetFiltro();
  }

}
