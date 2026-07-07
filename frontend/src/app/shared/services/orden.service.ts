import { inject ,Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TipoOrden } from '../interfaces/tipo-orden';

const _SERVIDOR = environment.servidor;

@Injectable({
  providedIn: 'root',
})
export class OrdenService {
  private readonly http = inject(HttpClient);
  filtrar(parametros: any, pageIndex: number, pageSize: number) {
    let params = new HttpParams;
    for (const key in parametros) {

        params = params.append(key, parametros[key]);
    }
    return this.http.get<any>(`${_SERVIDOR}/api/orden/filter/${pageIndex}/${pageSize}`, { params: params });
  }

  guardar(datos: TipoOrden,id?: number) {
    delete datos.id_orden;
    if(id){
      return this.http.put(`${_SERVIDOR}/api/orden/${id}`,datos);
    }
    return this.http.post(`${_SERVIDOR}/api/orden`,datos);
  }

   delete(id: number) {
    return this.http.delete(`${_SERVIDOR}/api/orden/${id}`);
  }

  cambiarEstado(id: number, estado: string) {
    return this.http.patch<any>(`${_SERVIDOR}/api/orden/estado/${id}`, { estado });
  }

  buscar(id: number) {
    return this.http.get<TipoOrden>(`${_SERVIDOR}/api/orden/${id}`);
  }
}
