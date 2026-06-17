import { inject ,Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TipoCliente } from '../interfaces/tipo-cliente';

const _SERVIDOR = environment.servidor;

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  filtrar(parametros: any, pageIndex: number, pageSize: number) {
    let params = new HttpParams;
    for (const key in parametros) {
      
        params = params.append(key, parametros[key]); 
    }
    return this.http.get<any>(`${_SERVIDOR}/api/cliente/filter/${pageIndex}/${pageSize}`, { params: params });
  }

  guardar(datos: TipoCliente,id?: number) {
    delete datos.id_cliente;
    if(id){
      return this.http.put(`${_SERVIDOR}/api/cliente/${id}`,datos); 
    }
    return this.http.post(`${_SERVIDOR}/api/cliente`,datos); 
  }

   delete(id: number) {
    return this.http.delete(`${_SERVIDOR}/api/cliente/${id}`);
  }

  resetPassw(cedula: string) {
    return this.http.patch(`${_SERVIDOR}/api/usuario/passw/reset/${cedula}`, {});
  }

  buscar(id: number) {
    return this.http.get<TipoCliente>(`${_SERVIDOR}/api/cliente/${id}`);
  }
}