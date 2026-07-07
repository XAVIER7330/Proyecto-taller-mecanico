export interface TipoOrden {
    id_orden?: string;
    fecha_entrada?: string;
    estado?: string;
    costo_total?: number;
    placa: string;
    nombre_cliente?: string;
    cedula?: string;
    nombre_mecanico?: string;
    id_diagnostico?: string;
    descripcion?: string;
    observaciones?: string;
}
