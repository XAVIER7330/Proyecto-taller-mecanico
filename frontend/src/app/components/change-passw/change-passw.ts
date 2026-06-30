import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FrmPassw } from '../forms/frm-passw/frm-passw';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-passw',
  imports: [],
  templateUrl: './change-passw.html',
  styleUrl: './change-passw.css',
})
export class ChangePassw {
  private readonly dialogo = inject(MatDialog);
  private readonly router = inject(Router)

  mostrarDialogo() {
    const dialogRef = this.dialogo.open(FrmPassw, {
      width: '100%',
      maxWidth: '400px',
      disableClose: true
    
      
    });
    dialogRef.afterClosed ( ).subscribe({
      complete: () => {
        this.router.navigate(['/home']);
      }
    })
  }

  ngOnInit(): void {
    this.mostrarDialogo();
  }
}
