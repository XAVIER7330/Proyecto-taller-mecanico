import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormField, FormRoot, form, minLength, required } from '@angular/forms/signals';
import { MatInput, MatInputModule } from '@angular/material/input';
import { LoginForm } from '../../../shared/interfaces/loginForm';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MatDialogClose } from '@angular/material/dialog';
import { FrmCliente } from '../frm-cliente/frm-cliente';
import { Usuario } from '../../../shared/services/usuario.service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';
import { validate } from '@angular/forms/signals';
import { passwordMisMatch } from '../../../shared/validators/passw-validator';
import { passworStrength } from '../../../shared/validators/passw-validator';


interface PasswForm {
    passw: string;
    passwN: string;
    passwR: string;
}

@Component({
  selector: 'app-frm-passw',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatFormField, FormRoot, MatInput, MatInputModule, FormField, MatDialogClose],
  templateUrl: './frm-passw.html',
  styleUrl: './frm-passw.css',
})
export class FrmPassw {

  private readonly router = inject(Router);
  private readonly srvAuth = inject(AuthService);
  private readonly srvUsuario = inject(Usuario)
  dialogRef = inject(MatDialogRef<FrmPassw>);
  public mostrarError = signal(false);
  hide = signal(true);
  private readonly dialog = inject (MatDialog);

  objPassw = signal<PasswForm>({  passw: '' ,passwN: '',passwR: ''});


 frmPassw = form(this.objPassw, (s)=> {
     required(s.passw, {message: 'usuario es requerido'});
    required(s.passwN, {message: 'Nueva contraseña es requerida'});
     minLength(s.passwN,8,{message: 'La contraseña debe tener al menos 8 caracteres'});
    required(s.passwR, {message: 'Repetir contraseña nueva'});
    passwordMisMatch(s.passwR, s.passwN);
    passworStrength(s.passwN);

  

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

toggleVisibility(event: MouseEvent){
  event.preventDefault()
  this.hide.update(value => !value);
}
changePassword(datos: PasswForm) {
    this.srvUsuario.changePassword(this.srvAuth.userActualS().cedula, {passw: datos.passw, passwN: datos.passwN, passwR: datos.passwR}).subscribe({
      next: () => {
        
        this.dialog.open(DialogoGeneral,{
          data : {
            texto : 'contraseña cambiada de forma correcta',
            icono : 'check',
            textAceptar : ' Aceptar '
          }
        }
          
        )
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
