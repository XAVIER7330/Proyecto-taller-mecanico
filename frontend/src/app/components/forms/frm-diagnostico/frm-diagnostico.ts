import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA , MatDialogModule,MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DiagnosticoService } from '../../../shared/services/diagnostico.service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';

@Component({
  selector: 'app-frm-diagnostico',
  imports: [MatDialogModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './frm-diagnostico.html',
  styleUrl: './frm-diagnostico.css',
})
export class FrmDiagnostico implements OnInit{
  titulo!: string;
  placa!: string;
  private data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  dialogRef = inject(MatDialogRef<FrmDiagnostico>);

  private builder = inject(FormBuilder);
  private srvDiagnostico = inject(DiagnosticoService);

  miForm : FormGroup;
  info:boolean = false;
  crearManual = false;
  constructor(){
    this.miForm = this.builder.group({
      id_diagnostico: [0],
      id_orden: [0, [Validators.required, Validators.min(1)]],
      descripcion: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      observaciones: ['',[Validators.maxLength(255)]],
      presupuesto_estimado: ['',[Validators.required, Validators.min(0)]]
    });
  }

  get F(){
    return this.miForm.controls;
  }

  onGuardar(){
    if(this.miForm.value.id_diagnostico === 0){
      this.srvDiagnostico.guardar(this.miForm.value).subscribe({
        complete: () => {
          this.dialog.open(DialogoGeneral, {
                data : {
                  texto : 'Diagnóstico registrado: la orden pasa a espera de aprobación',
                  icono : 'check',
                  textoAceptar : ' Aceptar '
                }
              });
          this.dialogRef.close();
        }
      });
    }else{
      this.srvDiagnostico.guardar(this.miForm.value, this.miForm.value.id_diagnostico).subscribe({
        complete: () => {
          this.dialog.open(DialogoGeneral, {
                data : {
                  texto : 'Diagnóstico modificado de forma correcta',
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
    this.placa = this.data.placa;
    this.crearManual = !this.placa;
    if (!this.crearManual) {
      this.miForm.patchValue({ id_orden: this.data.id_orden });
    }
    if(this.data.data){
      const datos = this.data.data[0];
      this.miForm.patchValue({
        id_diagnostico: datos.id_diagnostico,
        id_orden: datos.id_orden,
        descripcion: datos.descripcion,
        observaciones: datos.observaciones,
        presupuesto_estimado: datos.presupuesto_estimado
      });
    }
  }
}
