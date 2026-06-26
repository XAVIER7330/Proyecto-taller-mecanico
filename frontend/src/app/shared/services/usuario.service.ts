import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

const API_URL = environment.servidor + '/api/usuario';

@Injectable({
  providedIn: 'root',
})
export class Usuario {
  public readonly http = inject(HttpClient);

  public changePassword(cedula: string, data:{}){
    return this.http.patch<any>(`${API_URL}/passw/${cedula}`, data);
  }
}
