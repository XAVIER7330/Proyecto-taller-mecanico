import { AfterViewInit, Component, signal, viewChild, inject } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MecanicoService } from '../../shared/services/mecanico.service';

import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FrmMecanico } from '../forms/frm-mecanico/frm-mecanico';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { MatFabButton } from '@angular/material/button';
import { PrintService } from '../../shared/services/print-service';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormField, form } from '@angular/forms/signals';

import { TipoMecanico } from '../../shared/interfaces/tipo-mecanico';

type FilterForm = {
  cedula : string,
  nombre : string
}

@Component({
  selector: 'app-mecanico',
  imports: [MatCardModule, MatTableModule, MatIconModule, MatPaginatorModule,
            MatDialogModule, MatFabButton, MatExpansionModule, MatFormFieldModule, MatInput, FormField
  ],
  templateUrl: './mecanico.html',
  styleUrl: './mecanico.css',
})
export class Mecanico implements AfterViewInit {
  mostrarEncabezados: string[] = ['cedula', 'nombre', 'especialidad', 'botonera']

  dataSource = signal(new MatTableDataSource<TipoMecanico>());

  private readonly mecanicoSrv = inject(MecanicoService);
  readonly dialog = inject(MatDialog);
  private readonly srvPrint = inject(PrintService);

  paginator = viewChild(MatPaginator);
  arregloMecanicos: any = [];
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

  public mostrarDialogo(titulo: string, datos? : TipoMecanico, info? : boolean) {
    const dialogRef = this.dialog.open(FrmMecanico, {
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
    this.mostrarDialogo('Nuevo Mecánico');
  }

  onInfo(id : number) {
    this.mecanicoSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.mostrarDialogo('Información de Mecánico ', data, true);
        }
      });
  }
  onEdit(id : number) {
    this.mecanicoSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.mostrarDialogo('Modificar Mecánico ', data);
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
            this.mecanicoSrv.resetPassw(cedula)
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

  onDelete(idMecanico : number) {
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
            this.mecanicoSrv.delete(idMecanico)
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
    this.mecanicoSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (data) => {
          this.arregloMecanicos = data['data'];
          this.totalRecords.set(data['totalRegistros']);
          this.dataSource.set(new MatTableDataSource<TipoMecanico>(this.arregloMecanicos));
        },
        complete: () => {
          this.dataSource().paginator = this.paginator();
        }
      })
  }

  filtrar() {
    this.mecanicoSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (data) => {
          this.arregloMecanicos = data['data'];
          this.totalRecords.set(data['totalRegistros']);
          this.dataSource.set(new MatTableDataSource<TipoMecanico>(this.arregloMecanicos));
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.filtrar();
  }
  onPrint() {
    const columna = ['Cédula', 'Nombre', 'Especialidad'];
    this.mecanicoSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (res) => {
          const cuerpo = Object(res['data']).map((fila : any) => {
              const datos = [
                fila.cedula,
                fila.nombre,
                fila.especialidad
              ];
              return datos;
          });
          this.srvPrint.print(columna, cuerpo, 'Listado de Mecánicos', false)
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
