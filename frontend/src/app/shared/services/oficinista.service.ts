import { inject ,Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TipoOficinista } from '../interfaces/tipo-oficinista';

const _SERVIDOR = environment.servidor;

@Injectable({
  providedIn: 'root',
})
export class OficinistaService {
  private readonly http = inject(HttpClient);
  filtrar(parametros: any, pageIndex: number, pageSize: number) {
    let params = new HttpParams;
    for (const key in parametros) {

        params = params.append(key, parametros[key]);
    }
    return this.http.get<any>(`${_SERVIDOR}/api/oficinista/filter/${pageIndex}/${pageSize}`, { params: params });
  }

  guardar(datos: TipoOficinista,id?: number) {
    delete datos.id_oficinista;
    if(id){
      return this.http.put(`${_SERVIDOR}/api/oficinista/${id}`,datos);
    }
    return this.http.post(`${_SERVIDOR}/api/oficinista`,datos);
  }

   delete(id: number) {
    return this.http.delete(`${_SERVIDOR}/api/oficinista/${id}`);
  }

  resetPassw(cedula: string) {
    return this.http.patch(`${_SERVIDOR}/api/usuario/passw/reset/${cedula}`, {});
  }

  buscar(id: number) {
    return this.http.get<TipoOficinista>(`${_SERVIDOR}/api/oficinista/${id}`);
  }
}
