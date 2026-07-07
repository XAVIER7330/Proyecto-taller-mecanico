import { inject ,Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TipoDiagnostico } from '../interfaces/tipo-diagnostico';

const _SERVIDOR = environment.servidor;

@Injectable({
  providedIn: 'root',
})
export class DiagnosticoService {
  private readonly http = inject(HttpClient);

  filtrar(parametros: any, pageIndex: number, pageSize: number) {
    let params = new HttpParams;
    for (const key in parametros) {

        params = params.append(key, parametros[key]);
    }
    return this.http.get<any>(`${_SERVIDOR}/api/diagnostico/filter/${pageIndex}/${pageSize}`, { params: params });
  }

  buscarPorOrden(id_orden: number) {
    return this.http.get<any>(`${_SERVIDOR}/api/diagnostico/filter/0/1`, { params: { id_orden } });
  }

  guardar(datos: TipoDiagnostico,id?: number) {
    delete datos.id_diagnostico;
    if(id){
      return this.http.put(`${_SERVIDOR}/api/diagnostico/${id}`,datos);
    }
    return this.http.post(`${_SERVIDOR}/api/diagnostico`,datos);
  }

   delete(id: number) {
    return this.http.delete(`${_SERVIDOR}/api/diagnostico/${id}`);
  }

  buscar(id: number) {
    return this.http.get<TipoDiagnostico>(`${_SERVIDOR}/api/diagnostico/${id}`);
  }
}
