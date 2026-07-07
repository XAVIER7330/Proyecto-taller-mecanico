import { inject ,Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TipoMecanico } from '../interfaces/tipo-mecanico';

const _SERVIDOR = environment.servidor;

@Injectable({
  providedIn: 'root',
})
export class MecanicoService {
  private readonly http = inject(HttpClient);
  filtrar(parametros: any, pageIndex: number, pageSize: number) {
    let params = new HttpParams;
    for (const key in parametros) {

        params = params.append(key, parametros[key]);
    }
    return this.http.get<any>(`${_SERVIDOR}/api/mecanico/filter/${pageIndex}/${pageSize}`, { params: params });
  }

  guardar(datos: TipoMecanico,id?: number) {
    delete datos.id_mecanico;
    if(id){
      return this.http.put(`${_SERVIDOR}/api/mecanico/${id}`,datos);
    }
    return this.http.post(`${_SERVIDOR}/api/mecanico`,datos);
  }

   delete(id: number) {
    return this.http.delete(`${_SERVIDOR}/api/mecanico/${id}`);
  }

  resetPassw(cedula: string) {
    return this.http.patch(`${_SERVIDOR}/api/usuario/passw/reset/${cedula}`, {});
  }

  buscar(id: number) {
    return this.http.get<TipoMecanico>(`${_SERVIDOR}/api/mecanico/${id}`);
  }
}
