import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { MatInput, MatInputModule } from '@angular/material/input';
import { LoginForm } from '../../../shared/interfaces/loginForm';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FrmCliente } from '../frm-cliente/frm-cliente';
import { Usuario } from '../../../shared/services/usuario.service';


interface PasswForm {
    passw: string;
    passwN: string;
    passwR: string;
}

@Component({
  selector: 'app-frm-passw',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatFormField, FormRoot, MatInput, MatInputModule, FormField],
  templateUrl: './frm-passw.html',
  styleUrl: './frm-passw.css',
})
export class FrmPassw {

  private readonly router = inject(Router);
  private readonly srvAuth = inject(AuthService);
  private readonly srvUsuario = inject(Usuario)
  dialogRef = inject(MatDialogRef<FrmPassw>);
  mostrarError = signal(false);

  objPassw = signal<PasswForm>({  passw: '' ,passwN: '',passwR: ''});


 frmPassw = form(this.objPassw, (s)=> {
    required(s.passw, {message: 'La vieja contraseña es requerida'});
    required(s.passwN, {message: 'La nueva contraseña es requerida'});
    required(s.passwR, {message: 'La repetición de la contraseña es requerida'});
  },
{
  submission: {
    action: async f => {
      //console.log(f().value());
      this.changePassword(f().value());
    }
  }
}
);


changePassword(datos: PasswForm) {
    this.srvUsuario.changePassword(this.srvAuth.userActualS().cedula, {passw: datos.passw, passwN: datos.passwN, passwR: datos.passwR}).subscribe({
      next: (res) => {
        
        console.log('Cambio de contraseña correcto:');
        
        alert('Cambio de contraseña correcto');
         this.dialogRef.close();
         this.router.navigate(['/home']);
       
        
        
       
      },
      error: (err) => {
        this.mostrarError.set(true);
        console.error('Cambio Fallido:', err);
        // Handle login error, e.g., show error message to user
      },
      complete: () => {
        console.log('Cambio de contraseña completado');
      } 
  });
}

}
