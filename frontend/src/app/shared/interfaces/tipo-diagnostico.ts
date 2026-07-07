export interface TipoDiagnostico {
    id_diagnostico?: string;
    id_orden: number;
    descripcion: string;
    observaciones?: string;
    presupuesto_estimado: number;
    estado?: string;
    placa?: string;
}
