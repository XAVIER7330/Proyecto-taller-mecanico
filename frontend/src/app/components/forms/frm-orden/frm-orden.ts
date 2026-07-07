import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA , MatDialogModule,MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrdenService } from '../../../shared/services/orden.service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';

@Component({
  selector: 'app-frm-orden',
  imports: [MatDialogModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './frm-orden.html',
  styleUrl: './frm-orden.css',
})
export class FrmOrden implements OnInit{
  titulo!: string;
  private data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  dialogRef = inject(MatDialogRef<FrmOrden>);

  private builder = inject(FormBuilder);
  private srvOrden = inject(OrdenService);

  miForm : FormGroup;
  info:boolean = false;
  datosOrden = signal<any>(null);

  constructor(){
    this.miForm = this.builder.group({
      id_orden: [0],
      placa: ['',[Validators.required, Validators.pattern(/^[A-Za-z]{2,3}-\d{3,4}$/)]],
      cedula: ['',[Validators.pattern(/^([1-9]\d{8}|5\d{11})$/)]]
    });
  }

  get F(){
    return this.miForm.controls;
  }

  onGuardar(){
    const valores = {...this.miForm.value};
    if (!valores.cedula) {
      delete valores.cedula;
    }
    if(this.miForm.value.id_orden === 0){
      this.srvOrden.guardar(valores).subscribe({
        complete: () => {
          this.dialog.open(DialogoGeneral, {
                data : {
                  texto : 'Orden creada de forma correcta',
                  icono : 'check',
                  textoAceptar : ' Aceptar '
                }
              });
          this.dialogRef.close();
        }
      });
    }else{
      this.srvOrden.guardar(valores, this.miForm.value.id_orden).subscribe({
        complete: () => {
          this.dialog.open(DialogoGeneral, {
                data : {
                  texto : 'Orden modificada de forma correcta',
                  icono : 'info',
                  textoAceptar : ' Aceptar '
                }
              });
          this.dialogRef.close();
        }
      });
    }
  }

  ngOnInit(): void {
    this.titulo = this.data.title;
    this.info = this.data.info;
    if(this.data.data){
      const datos = this.data.data[0];
      this.datosOrden.set(datos);
      this.miForm.patchValue({
        id_orden: datos.id_orden,
        placa: datos.placa,
        cedula: datos.cedula ?? ''
      });
    }
  }
}
