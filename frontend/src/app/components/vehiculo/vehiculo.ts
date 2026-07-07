import { AfterViewInit, Component, signal, viewChild, inject } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { VehiculoService } from '../../shared/services/vehiculo.service';

import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FrmVehiculo } from '../forms/frm-vehiculo/frm-vehiculo';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { MatFabButton } from '@angular/material/button';
import { PrintService } from '../../shared/services/print-service';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormField, form } from '@angular/forms/signals';

import { TipoVehiculo } from '../../shared/interfaces/tipo-vehiculo';

type FilterForm = {
  placa : string,
  cedula : string
}

@Component({
  selector: 'app-vehiculo',
  imports: [MatCardModule, MatTableModule, MatIconModule, MatPaginatorModule,
            MatDialogModule, MatFabButton, MatExpansionModule, MatFormFieldModule, MatInput, FormField
  ],
  templateUrl: './vehiculo.html',
  styleUrl: './vehiculo.css',
})
export class Vehiculo implements AfterViewInit {
  mostrarEncabezados: string[] = ['placa', 'marca', 'modelo', 'anio', 'nombre_cliente', 'botonera']

  dataSource = signal(new MatTableDataSource<TipoVehiculo>());

  private readonly vehiculoSrv = inject(VehiculoService);
  readonly dialog = inject(MatDialog);
  private readonly srvPrint = inject(PrintService);

  paginator = viewChild(MatPaginator);
  arregloVehiculos: any = [];
  filtro : any;
  totalRecords = signal<number>(0);
  pageIndex = signal<number>(0);
  pageSize = signal<number>(5);
  public panelFilterState = signal(false);

  objFilter = signal<FilterForm>({
    placa : '',
    cedula : ''
  });

  frmFilter = form(this.objFilter, (s) => {
    s.placa;
    s.cedula;
  });

  public mostrarDialogo(titulo: string, datos? : TipoVehiculo, info? : boolean) {
    const dialogRef = this.dialog.open(FrmVehiculo, {
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

  onPlacaChange(event : Event) {
    this.filtro.placa = (event.target as HTMLInputElement).value;
    this.filtrar();
  }
  onCedulaChange(event : Event) {
    this.filtro.cedula = (event.target as HTMLInputElement).value;
    this.filtrar();
  }
  onFilterClose() {
    this.resetFiltro();
    this.frmFilter().reset({placa: '', cedula:''});
  }
  onCreate() {
    this.mostrarDialogo('Nuevo Vehículo');
  }

  onInfo(id : number) {
    this.vehiculoSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.mostrarDialogo('Información de Vehículo ', data, true);
        }
      });
  }
  onEdit(id : number) {
    this.vehiculoSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.mostrarDialogo('Modificar Vehículo ', data);
        }
      });
  }

  onDelete(idVehiculo : number) {
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
            this.vehiculoSrv.delete(idVehiculo)
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
    this.vehiculoSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (data) => {
          this.arregloVehiculos = data['data'];
          this.totalRecords.set(data['totalRegistros']);
          this.dataSource.set(new MatTableDataSource<TipoVehiculo>(this.arregloVehiculos));
        },
        complete: () => {
          this.dataSource().paginator = this.paginator();
        }
      })
  }

  filtrar() {
    this.vehiculoSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (data) => {
          this.arregloVehiculos = data['data'];
          this.totalRecords.set(data['totalRegistros']);
          this.dataSource.set(new MatTableDataSource<TipoVehiculo>(this.arregloVehiculos));
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.filtrar();
  }
  onPrint() {
    const columna = ['Placa', 'Marca', 'Modelo', 'Año', 'Cliente'];
    this.vehiculoSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (res) => {
          const cuerpo = Object(res['data']).map((fila : any) => {
              const datos = [
                fila.placa,
                fila.marca,
                fila.modelo,
                fila.anio,
                fila.nombre_cliente
              ];
              return datos;
          });
          this.srvPrint.print(columna, cuerpo, 'Listado de Vehículos', false)
        },
      });
  }

  resetFiltro() {
    this.filtro = {placa : '', cedula : ''};
    this.filtroInicial();
  }

  ngAfterViewInit(): void {
    this.resetFiltro();
  }

}
