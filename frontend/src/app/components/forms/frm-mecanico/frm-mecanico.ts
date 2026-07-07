import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA , MatDialogModule,MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MecanicoService } from '../../../shared/services/mecanico.service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';

@Component({
  selector: 'app-frm-mecanico',
  imports: [MatDialogModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './frm-mecanico.html',
  styleUrl: './frm-mecanico.css',
})
export class FrmMecanico implements OnInit{
  titulo!: string;
  private data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  dialogRef = inject(MatDialogRef<FrmMecanico>);

  private builder = inject(FormBuilder);
  private srvMecanico = inject(MecanicoService);

  miForm : FormGroup;
  info:boolean = false;
  constructor(){
    this.miForm = this.builder.group({
      id_mecanico: [0],
      cedula: ['',[Validators.required, Validators.pattern(/^([1-9]\d{8}|5\d{11})$/)]],
      nombre: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ]+)( ([a-zA-ZñÑáéíóúÁÉÍÓÚ]+)){1,3}')]],
      especialidad: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
    });
  }

  get F(){
    return this.miForm.controls;
  }

  onGuardar(){
    if(this.miForm.value.id_mecanico === 0){
      this.srvMecanico.guardar(this.miForm.value).subscribe({
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
      this.srvMecanico.guardar(this.miForm.value, this.miForm.value.id_mecanico).subscribe({
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
