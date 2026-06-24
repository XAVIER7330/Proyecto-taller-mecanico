import { AfterViewInit, Component, signal, viewChild, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { ClienteService } from '../../shared/services/cliente.service';
import { TipoCliente } from '../../shared/interfaces/tipo-cliente';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { FrmCliente } from '../forms/frm-cliente/frm-cliente';
import { Title } from '@angular/platform-browser';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { MatFabButton } from "@angular/material/button";
import { PrintService } from '../../shared/services/print-service';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormField, form} from '@angular/forms/signals';

type FilterForm = {
  cedula: string;
  nombre: string;
};

@Component({
  selector: 'app-cliente',
  imports: [MatCardModule, MatTableModule, MatIconModule, MatPaginatorModule, MatDialogModule,
     MatFabButton, MatExpansionModule,MatFormFieldModule, MatInput, FormField ],
  templateUrl: './cliente.html',
  styleUrl: './cliente.css',
})
export class Cliente implements AfterViewInit{
  mostrarEncabezados : string[] = ['cedula', 'nombre', 'telefono', 'email', 'botonera'];
  dataSource = signal(new MatTableDataSource<TipoCliente>());
  private readonly clienteSrv = inject(ClienteService);
  readonly dialog = inject(MatDialog);
  private readonly srvPrint = inject(PrintService);

  paginator = viewChild(MatPaginator);
  arregloClientes: any = [];
  filtro: any ;
  totalRecords = signal<number>(0);
  pageIndex = signal<number>(0);
  pageSize = signal<number>(0);
  panelFilterState = signal<boolean>(false);

  objFilter = signal<FilterForm>({ cedula: '', nombre: '' });

  frmFilter =  form(this.objFilter, (s)=> {
    s.cedula;
    s.nombre;
  });



  mostrarDialogo(titulo: string, datos ? : TipoCliente, info? :boolean){
    const dialogRef = this.dialog.open(FrmCliente,{width: '50vw', 
      maxWidth: '35rem', 
    data: {title: titulo,
        data: datos,
        info: info,
        
        

    }, disableClose: true
  });
    dialogRef.afterClosed().subscribe({
      complete: () => {
        this.resetFiltro();
      }
    });
  }

  onCedulaChange(event: Event) {
    this.filtro.cedula = (event.target as HTMLInputElement).value;
    this.filtroInicial();
  }

  onNombreChange(event: Event) {
    this.filtro.nombre = (event.target as HTMLInputElement).value;
    this.filtroInicial();
    
  }

  onFilterClose() {
    this.panelFilterState.set(false);
    this.frmFilter().reset({ cedula: '', nombre: '' });
    this.resetFiltro();
    
  }

  onCreate(){
    this.mostrarDialogo('Nuevo Cliente');
  }

  onInfo(id : number){

    this.clienteSrv.buscar(id).subscribe({
      next: (data) => {
        this.mostrarDialogo('Informacion Cliente', data, true);
      }
  });
}

  onEdit(id : number){

    this.clienteSrv.buscar(id).subscribe({
      next: (data) => {
        this.mostrarDialogo('Editar Cliente', data);
      }
  });

  }

  onPrint(){

    const columnas = ['Cédula', 'Nombre', 'Teléfono', 'Correo'];
    this.clienteSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize()).subscribe({
      next: (res) => {

        const cuerpo = Object(res['data']).map((fila: any) => {
          const datos = [fila.cedula, fila.nombre, fila.telefono, fila.email];
          return datos;
        });
        this.srvPrint.print(columnas, cuerpo, 'Listado de Clientes', false);
      }
      
    });

  }

  OnDelete(idCliente : number){
    const dialogRef = this.dialog.open(DialogoGeneral,{
      data: {
        texto: '¿Está seguro que desea eliminar el cliente con id: '+ idCliente +'?',
        icono: 'question_mark',
        textoAceptar: ' Sí ',
        textoCancelar: ' No '
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        this.clienteSrv.delete(idCliente).subscribe(
          {
            complete: () => {
              this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Cliente eliminado de forma correcta',
              icono: 'info',
              textoAceptar: ' Aceptar '
            }
          });
              this.resetFiltro();
            }
          });
      }
    });
  }


  onResetPassw(cedula : string){
    const dialogRef = this.dialog.open(DialogoGeneral,{
      data: {
        texto: '¿Está seguro que desea restablecer la contraseña del cliente con cédula: '+ cedula +'?',
        icono: 'question_mark',
        textoAceptar: ' Sí ',
        textoCancelar: ' No '
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        this.clienteSrv.resetPassw(cedula).subscribe(
          {
            complete: () => {
              this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Contraseña restablecida de forma correcta',
              icono: 'info',
              textoAceptar: ' Aceptar '
            }
          });
              this.resetFiltro();
            }
          });
      }
    });
  }


  filtroInicial() {
    this.clienteSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize()).subscribe( {
      next: (data) => {
        this.arregloClientes = data['data'];
        this.totalRecords.set(data['totalRegistros']);
        this.dataSource.set(new MatTableDataSource<TipoCliente>(this.arregloClientes));
      },
      error: (err) => {
        
      },
      complete: () => {
        this.dataSource().paginator = this.paginator();
      }
    });
  }

   filtrar() {
    this.clienteSrv.filtrar(this.filtro, this.pageIndex(), this.pageSize()).subscribe( {
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
  resetFiltro(){
    this.filtro = {cedula: '', nombre: '' }
    this.filtroInicial();
  }

  ngAfterViewInit(): void {
    this.filtro = {cedula: '', nombre: '' }
    this.filtroInicial();
     this.dataSource().paginator = this.paginator();
  }
}
