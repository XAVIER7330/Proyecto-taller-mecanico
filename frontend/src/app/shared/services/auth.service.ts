import { inject, Injectable, signal } from '@angular/core';
import { LoginForm } from '../interfaces/loginForm';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, of } from 'rxjs';
import { TokensService } from './tokens.service';
import { Router } from '@angular/router';
import { User } from '../models/User';
import { FrmLogin } from '../../components/forms/frm-login/frm-login';
import { IToken } from '../interfaces/iToken';


const API_URL = environment.servidor + '/api/auth';
@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private http = inject(HttpClient);
  private readonly srvTokens = inject(TokensService);
  private readonly router = inject(Router);
  public userActualS = signal(new User);

  public login(datos : LoginForm) {
    return this.http.patch<any>(API_URL,datos)
    .pipe(
      tap((tokens) => {
        console.log('Tokens received:', tokens);
        this.doLogin(tokens);
      }),
      map(() => true),
      catchError((error) => {
        return of(error.status);
      })
    );
    // Implementation for login
  }

  public logout() {
    if (this.isLoggedIn()) {
      this.http.patch(`${API_URL}/logout/${this.userActual.cedula}`,{})
      .subscribe();
      this.doLogout();
    }
  }
  doLogin(tokens: any){
    this.srvTokens.setTokens(tokens);
    this.userActualS.set(this.userActual);
    this.router.navigate(['/home']);
  
  }

  doLogout(){
    if (this.srvTokens.token){
      this.srvTokens.eliminarTokens();
      this.userActualS.set(this.userActual);
      this.router.navigate(['/login']);
    }
  }

  public isLoggedIn(): boolean {
    return !!this.srvTokens.token && !this.srvTokens.jwtTokenExp();
  }

  public get userActual(): User {
    if (!this.srvTokens.token) {
      return new User();
    }else {
      const tokenD = this.srvTokens.decodeToken();
      return new User({cedula: tokenD.sub, nombre: tokenD.nom, rol: tokenD.rol});
  }
  }

  public refreshSession() : any {
    if (this.isLoggedIn() && this.srvTokens.tokenTimeToExpire() <= 20) {
       return this.http.patch<IToken>(`${API_URL}/refresh/${this.userActual.cedula}`,{tkRef: this.srvTokens.refreshToken})
    .pipe(
      tap((tokens) => {
        console.log('Tokens received:', tokens);
        this.doLogin(tokens);
      }),
      map(() => true),
      catchError((error) => {
        return of(error.status);
      })
    );
    
    }
  }
}
