import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


@Injectable({
  providedIn: 'root'
})
export class PrintService {
  print(columna: string[], cuerpo: Array<any>, encabezado: string, guardar ? : boolean) {

    const doc = new jsPDF({orientation: 'portrait', //laandscape
       unit: 'px',
        format: 'letter'});
    doc.text(encabezado, (doc.internal.pageSize.width / 2), 25, { align: 'center' });
    autoTable(doc, {
      head: [columna],
      body: cuerpo
    });
    if(guardar) {
      const today = new Date();
      let nombreArchivo = `reporte_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.pdf`;
      doc.save(nombreArchivo);
    }
    else {
   doc.output('dataurlnewwindow');
    }
    
}
 }
