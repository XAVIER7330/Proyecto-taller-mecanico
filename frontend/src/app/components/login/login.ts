import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FrmLogin } from '../forms/frm-login/frm-login';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private readonly dialogo = inject(MatDialog);

  mostrarDialogo() {
    const dialogRef = this.dialogo.open(FrmLogin, {
      width: '35vw',
      maxWidth: '45rem',
      disableClose: true,
      
    });
  }

  ngOnInit(): void {
    this.mostrarDialogo();
  }

}
