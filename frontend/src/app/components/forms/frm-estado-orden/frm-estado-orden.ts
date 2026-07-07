import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrdenService } from '../../../shared/services/orden.service';

const ESTADOS: { valor: string, etiqueta: string }[] = [
  { valor: 'INGRESADO', etiqueta: 'Ingresado' },
  { valor: 'EN_DIAGNOSTICO', etiqueta: 'En diagnóstico' },
  { valor: 'ESPERANDO_APROBACION', etiqueta: 'Esperando aprobación' },
  { valor: 'EN_REPARACION', etiqueta: 'En reparación' },
  { valor: 'LISTO_PARA_ENTREGA', etiqueta: 'Listo para entrega' },
  { valor: 'ENTREGADO', etiqueta: 'Entregado' }
];

@Component({
  selector: 'app-frm-estado-orden',
  imports: [MatDialogModule, MatDividerModule, MatFormFieldModule, MatSelectModule, MatIconModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './frm-estado-orden.html',
  styleUrl: './frm-estado-orden.css',
})
export class FrmEstadoOrden implements OnInit {
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<FrmEstadoOrden>);
  private readonly builder = inject(FormBuilder);
  private readonly ordenSrv = inject(OrdenService);

  readonly estados = ESTADOS;

  miForm: FormGroup;

  constructor() {
    this.miForm = this.builder.group({
      estado: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.miForm.patchValue({ estado: this.data.estadoActual });
  }

  onGuardar() {
    this.ordenSrv.cambiarEstado(this.data.id_orden, this.miForm.value.estado)
      .subscribe({
        complete: () => {
          this.dialogRef.close(true);
        }
      });
  }
}
