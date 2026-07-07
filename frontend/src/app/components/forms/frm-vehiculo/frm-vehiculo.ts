import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA , MatDialogModule,MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehiculoService } from '../../../shared/services/vehiculo.service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';

const ANIO_MINIMO = 1980;
const ANIO_MAXIMO = 2100;

@Component({
  selector: 'app-frm-vehiculo',
  imports: [MatDialogModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './frm-vehiculo.html',
  styleUrl: './frm-vehiculo.css',
})
export class FrmVehiculo implements OnInit{
  titulo!: string;
  private data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  dialogRef = inject(MatDialogRef<FrmVehiculo>);

  private builder = inject(FormBuilder);
  private srvVehiculo = inject(VehiculoService);

  miForm : FormGroup;
  info:boolean = false;
  constructor(){
    this.miForm = this.builder.group({
      id_vehiculo: [0],
      placa: ['',[Validators.required, Validators.pattern(/^[A-Za-z]{2,3}-\d{3,4}$/)]],
      marca: ['',[Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      modelo: ['',[Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      anio: ['',[Validators.required, Validators.min(ANIO_MINIMO), Validators.max(ANIO_MAXIMO)]],
      cedula: ['',[Validators.required, Validators.pattern(/^([1-9]\d{8}|5\d{11})$/)]]
    });
  }

  get F(){
    return this.miForm.controls;
  }

  onGuardar(){
    if(this.miForm.value.id_vehiculo === 0){
      this.srvVehiculo.guardar(this.miForm.value).subscribe({
        complete: () => {
          this.dialog.open(DialogoGeneral, {
                data : {
                  texto : 'Registro creado de forma correcta',
                  icono : 'check',
                  textoAceptar : ' Aceptar '
                }
              });
          this.dialogRef.close();
        }
      });
    }else{
      this.srvVehiculo.guardar(this.miForm.value, this.miForm.value.id_vehiculo).subscribe({
        complete: () => {
          this.dialog.open(DialogoGeneral, {
                data : {
                  texto : 'Registro modificado de forma correcta',
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
      this.miForm.patchValue({
        id_vehiculo: datos.id_vehiculo,
        placa: datos.placa,
        marca: datos.marca,
        modelo: datos.modelo,
        anio: datos.anio,
        cedula: datos.cedula
      });
    }
  }
}
