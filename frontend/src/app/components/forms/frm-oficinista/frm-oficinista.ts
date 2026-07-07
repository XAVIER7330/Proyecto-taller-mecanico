import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA , MatDialogModule,MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OficinistaService } from '../../../shared/services/oficinista.service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';

@Component({
  selector: 'app-frm-oficinista',
  imports: [MatDialogModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './frm-oficinista.html',
  styleUrl: './frm-oficinista.css',
})
export class FrmOficinista implements OnInit{
  titulo!: string;
  private data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  dialogRef = inject(MatDialogRef<FrmOficinista>);

  private builder = inject(FormBuilder);
  private srvOficinista = inject(OficinistaService);

  miForm : FormGroup;
  info:boolean = false;
  constructor(){
    this.miForm = this.builder.group({
      id_oficinista: [0],
      cedula: ['',[Validators.required, Validators.pattern(/^([1-9]\d{8}|5\d{11})$/)]],
      nombre: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ]+)( ([a-zA-ZñÑáéíóúÁÉÍÓÚ]+)){1,3}')]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get F(){
    return this.miForm.controls;
  }

  onGuardar(){
    if(this.miForm.value.id_oficinista === 0){
      this.srvOficinista.guardar(this.miForm.value).subscribe({
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
      this.srvOficinista.guardar(this.miForm.value, this.miForm.value.id_oficinista).subscribe({
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
      this.miForm.setValue(this.data.data[0]);
    }
  }
}
