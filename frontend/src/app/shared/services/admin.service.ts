import { inject ,Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TipoAdmin } from '../interfaces/tipo-admin';

const _SERVIDOR = environment.servidor;

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  filtrar(parametros: any, pageIndex: number, pageSize: number) {
    let params = new HttpParams;
    for (const key in parametros) {

        params = params.append(key, parametros[key]);
    }
    return this.http.get<any>(`${_SERVIDOR}/api/admin/filter/${pageIndex}/${pageSize}`, { params: params });
  }

  guardar(datos: TipoAdmin,id?: number) {
    delete datos.id_administrador;
    if(id){
      return this.http.put(`${_SERVIDOR}/api/admin/${id}`,datos);
    }
    return this.http.post(`${_SERVIDOR}/api/admin`,datos);
  }

   delete(id: number) {
    return this.http.delete(`${_SERVIDOR}/api/admin/${id}`);
  }

  resetPassw(cedula: string) {
    return this.http.patch(`${_SERVIDOR}/api/usuario/passw/reset/${cedula}`, {});
  }

  buscar(id: number) {
    return this.http.get<TipoAdmin>(`${_SERVIDOR}/api/admin/${id}`);
  }
}
