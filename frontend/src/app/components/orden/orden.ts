import { AfterViewInit, Component, signal, viewChild, inject } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { OrdenService } from '../../shared/services/orden.service';
import { DiagnosticoService } from '../../shared/services/diagnostico.service';

import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FrmOrden } from '../forms/frm-orden/frm-orden';
import { FrmDiagnostico } from '../forms/frm-diagnostico/frm-diagnostico';
import { FrmEstadoOrden } from '../forms/frm-estado-orden/frm-estado-orden';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { MatFabButton } from '@angular/material/button';
import { PrintService } from '../../shared/services/print-service';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormField, form } from '@angular/forms/signals';

import { TipoOrden } from '../../shared/interfaces/tipo-orden';

type FilterForm = {
  placa : string,
  estado : string
}

@Component({
  selector: 'app-orden',
  imports: [MatCardModule, MatTableModule, MatIconModule, MatPaginatorModule,
            MatDialogModule, MatFabButton, MatExpansionModule, MatFormFieldModule, MatInput, MatSelectModule, FormField, MatTooltipModule
  ],
  templateUrl: './orden.html',
  styleUrl: './orden.css',
})
export class Orden implements AfterViewInit {
  mostrarEncabezados: string[] = ['id_orden', 'fecha_entrada', 'placa', 'nombre_cliente', 'nombre_mecanico', 'estado', 'descripcion', 'costo_total', 'botonera']

  readonly estados: { valor: string, etiqueta: string }[] = [
    { valor: 'INGRESADO', etiqueta: 'Ingresado' },
    { valor: 'EN_DIAGNOSTICO', etiqueta: 'En diagnóstico' },
    { valor: 'ESPERANDO_APROBACION', etiqueta: 'Esperando aprobación' },
    { valor: 'EN_REPARACION', etiqueta: 'En reparación' },
    { valor: 'LISTO_PARA_ENTREGA', etiqueta: 'Listo para entrega' },
    { valor: 'ENTREGADO', etiqueta: 'Entregado' }
  ];

  dataSource = signal(new MatTableDataSource<TipoOrden>());

  private readonly ordenSrv = inject(OrdenService);
  private readonly diagnosticoSrv = inject(DiagnosticoService);
  readonly dialog = inject(MatDialog);
  private readonly srvPrint = inject(PrintService);

  paginator = viewChild(MatPaginator);
  arregloOrdenes: any = [];
  filtro : any;
  totalRecords = signal<number>(0);
  pageIndex = signal<number>(0);
  pageSize = signal<number>(5);
  public panelFilterState = signal(false);

  objFilter = signal<FilterForm>({
    placa : '',
    estado : ''
  });

  frmFilter = form(this.objFilter, (s) => {
    s.placa;
    s.estado;
  });

  public mostrarDialogo(titulo: string, datos? : TipoOrden, info? : boolean) {
    const dialogRef = this.dialog.open(FrmOrden, {
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

  public mostrarDialogoDiagnostico(orden: TipoOrden, existente?: any, info?: boolean) {
    const dialogRef = this.dialog.open(FrmDiagnostico, {
      width: '50vw',
      maxWidth: '35rem',
      data: {
        title: existente ? 'Diagnóstico de la orden' : 'Registrar diagnóstico y presupuesto',
        id_orden: orden.id_orden,
        placa: orden.placa,
        data: existente,
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

  } //Fin de mostrarDialogoDiagnostico

  onPlacaChange(event : Event) {
    this.filtro.placa = (event.target as HTMLInputElement).value;
    this.filtrar();
  }
  onEstadoChange(estado : string) {
    this.filtro.estado = estado;
    this.filtrar();
  }

  estadoLabel(valor: string): string {
    return this.estados.find(e => e.valor === valor)?.etiqueta ?? valor;
  }
  onFilterClose() {
    this.resetFiltro();
    this.frmFilter().reset({placa: '', estado:''});
  }
  onCreate() {
    this.mostrarDialogo('Nueva Orden de Reparación');
  }

  onInfo(id : number) {
    this.ordenSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.mostrarDialogo('Información de Orden ', data, true);
        }
      });
  }
  onEdit(id : number) {
    this.ordenSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.mostrarDialogo('Modificar Orden ', data);
        }
      });
  }

  onDiagnosticar(orden: TipoOrden) {
    this.diagnosticoSrv.buscarPorOrden(Number(orden.id_orden))
      .subscribe({
        next: (res) => {
          const existente = res['data']?.length ? res['data'] : null;
          this.mostrarDialogoDiagnostico(orden, existente);
        }
      });
  }

  onCambiarEstado(orden: TipoOrden) {
    const dialogRef = this.dialog.open(FrmEstadoOrden, {
      width: '30vw',
      maxWidth: '25rem',
      data: {
        id_orden: orden.id_orden,
        estadoActual: orden.estado
      },
      disableClose : true
    });

    dialogRef.afterClosed()
      .subscribe((res) => {
        if (res === true) {
          this.resetFiltro();
          this.dialog.open(DialogoGeneral,{
            data : {
              texto: 'Estado de la orden actualizado',
              icono : 'info',
              textoAceptar : ' Aceptar '
            }
          });
        }
      });
  } //Fin de onCambiarEstado

  onDelete(idOrden : number) {
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
            this.ordenSrv.delete(idOrden)
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
    this.ordenSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (data) => {
          this.arregloOrdenes = data['data'];
          this.totalRecords.set(data['totalRegistros']);
          this.dataSource.set(new MatTableDataSource<TipoOrden>(this.arregloOrdenes));
        },
        complete: () => {
          this.dataSource().paginator = this.paginator();
        }
      })
  }

  filtrar() {
    this.ordenSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (data) => {
          this.arregloOrdenes = data['data'];
          this.totalRecords.set(data['totalRegistros']);
          this.dataSource.set(new MatTableDataSource<TipoOrden>(this.arregloOrdenes));
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.filtrar();
  }
  onPrint() {
    const columna = ['Orden', 'Fecha', 'Placa', 'Cliente', 'Mecánico', 'Estado', 'Diagnóstico', 'Costo Total'];
    this.ordenSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (res) => {
          const cuerpo = Object(res['data']).map((fila : any) => {
              const datos = [
                fila.id_orden,
                fila.fecha_entrada,
                fila.placa,
                fila.nombre_cliente,
                fila.nombre_mecanico,
                fila.estado,
                fila.descripcion ?? 'Sin diagnosticar',
                fila.costo_total
              ];
              return datos;
          });
          this.srvPrint.print(columna, cuerpo, 'Listado de Órdenes de Reparación', false)
        },
      });
  }

  resetFiltro() {
    this.filtro = {placa : '', estado : ''};
    this.filtroInicial();
  }

  ngAfterViewInit(): void {
    this.resetFiltro();
  }

}
