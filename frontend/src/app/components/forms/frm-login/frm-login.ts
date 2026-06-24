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



@Component({
  selector: 'app-frm-login',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatFormField, FormRoot, MatInput, MatInputModule, FormField],
  templateUrl: './frm-login.html',
  styleUrl: './frm-login.css',
})
export class FrmLogin {
  private readonly srvAuth = inject(AuthService);
  private readonly router = inject(Router);
  dialogRef = inject(MatDialogRef<FrmCliente>);
  mostrarError = signal(false);

  objLogin = signal<LoginForm>({ cedula: '', passw: '' });

  frmLogin = form(this.objLogin, (s)=> {
    required(s.cedula, {message: 'La cédula es requerida'});
    required(s.passw, {message: 'La contraseña es requerida'});
  },
{
  submission: {
    action: async f => {
      //console.log(f().value());
      this.login(f().value());
    }
  }
}
);
login(datos: LoginForm) {
    this.srvAuth.login(datos).subscribe({
      next: (res) => {
        this.mostrarError.set(res === 401);
        console.log('Login correcto:', res);
        if (res && res != 401) {
         this.dialogRef.close();
         this.router.navigate(['/home']);
        }
        
       
      },
      error: (err) => {
        console.error('Login fallido:', err);
        // Handle login error, e.g., show error message to user
      },
      complete: () => {
        console.log('Logeado');
      } 
  });
}
}
