import { inject ,Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TipoVehiculo } from '../interfaces/tipo-vehiculo';

const _SERVIDOR = environment.servidor;

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private readonly http = inject(HttpClient);
  filtrar(parametros: any, pageIndex: number, pageSize: number) {
    let params = new HttpParams;
    for (const key in parametros) {

        params = params.append(key, parametros[key]);
    }
    return this.http.get<any>(`${_SERVIDOR}/api/vehiculo/filter/${pageIndex}/${pageSize}`, { params: params });
  }

  guardar(datos: TipoVehiculo,id?: number) {
    delete datos.id_vehiculo;
    if(id){
      return this.http.put(`${_SERVIDOR}/api/vehiculo/${id}`,datos);
    }
    return this.http.post(`${_SERVIDOR}/api/vehiculo`,datos);
  }

   delete(id: number) {
    return this.http.delete(`${_SERVIDOR}/api/vehiculo/${id}`);
  }

  buscar(id: number) {
    return this.http.get<TipoVehiculo>(`${_SERVIDOR}/api/vehiculo/${id}`);
  }
}
