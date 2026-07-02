import { AfterViewInit, Component, signal, viewChild, inject } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { ClienteService } from '../../shared/services/cliente.service';

import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FrmCliente } from '../forms/frm-cliente/frm-cliente';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { MatFabButton } from '@angular/material/button';
import { PrintService } from '../../shared/services/print-service';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormField, form } from '@angular/forms/signals';


import { TipoCliente } from '../../shared/interfaces/tipo-cliente';



type FilterForm = {
  cedula : string,
  nombre : string
}

@Component({
  selector: 'app-cliente',
  imports: [MatCardModule, MatTableModule, MatIconModule, MatPaginatorModule,
            MatDialogModule, MatFabButton, MatExpansionModule, MatFormFieldModule, MatInput, FormField
  ],
  templateUrl: './cliente.html',
  styleUrl: './cliente.css',
})
export class Cliente implements AfterViewInit {
  mostrarEncabezados: string[] = ['cedula', 'nombre', 'telefono', 'email', 'botonera']

  dataSource = signal(new MatTableDataSource<TipoCliente>());

  private readonly clienteSrv = inject(ClienteService);
  readonly dialog = inject(MatDialog);
  private readonly srvPrint = inject(PrintService);
  

  paginator = viewChild(MatPaginator);
  arregloClientes: any = [];
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


  public mostrarDialogo(titulo: string, datos? : TipoCliente, info? : boolean) {
    const dialogRef = this.dialog.open(FrmCliente, {
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
    console.log(this.filtro);
    this.filtrar();
  }
  onNombreChange(event : Event) {
    this.filtro.nombre = (event.target as HTMLInputElement).value;
    console.log(this.filtro);
    this.filtrar();
    
    //console.log((event.target as HTMLElement).id);
  }
  onFilterClose() {
    this.resetFiltro(); 
    this.frmFilter().reset({cedula: '', nombre:''});
  }
  onCreate() {
    this.mostrarDialogo('Nuevo Cliente');
  }

  onInfo(id : number) {
    
    this.clienteSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.mostrarDialogo('Información de Cliente ', data, true);
        }
      });
  }
  onEdit(id : number) {
    
    this.clienteSrv.buscar(id)
      .subscribe({
        next: (data) => {
  
          this.mostrarDialogo('Modificar Cliente ', data);
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
            this.clienteSrv.resetPassw(cedula)
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

  onDelete(idCliente : number) {
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
            this.clienteSrv.delete(idCliente)
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
    this.clienteSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (data) => {
          console.log(data);
          this.arregloClientes = data['data'];
          this.totalRecords.set(data['totalRegistros']);
          this.dataSource.set(new MatTableDataSource<TipoCliente>(this.arregloClientes));
        },
        complete: () => {
          this.dataSource().paginator = this.paginator();
        }
      })
  }

  filtrar() {
    this.clienteSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (data) => {
          this.arregloClientes = data['data'];
          this.totalRecords.set(data['totalRegistros']);
          this.dataSource.set(new MatTableDataSource<TipoCliente>(this.arregloClientes));
        }
      });
  }  

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.filtrar();
  }
  onPrint() {
    const columna = ['Cédula', 'Nombre', 'Teléfono', 'Correo'];
    this.clienteSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize())

      .subscribe({
        next: (res) => {
          const cuerpo = Object(res['data']).map((fila : any) => {
              const datos = [
                fila.cedula,
                fila.nombre,
                fila.telefono,
                fila.email
              ];
              return datos;
          }); 
          this.srvPrint.print(columna, cuerpo, 'Listado de Clientes', false)        
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
