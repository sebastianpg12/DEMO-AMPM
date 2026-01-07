const XLSX = require('xlsx');
const path = require('path');

const SHEET_NAMES = [
    'Retraso de entrega',
    'Agilización de entrega',
    'Visita en falso',
    'DNR',
    'Paquete no deseado',
    'Envío sin actualización',
    'Entrega errónea',
    'Paquete dañado',
    'Sustracción',
    'Queja al operador'
];

const HEADERS = [
    'Guia',
    'Nombre Contacto',
    'Telefono Contacto',
    'Correo Contacto',
    'Cedis Destino',
    'Agente Asignado',
    'Descripcion',
    'Prioridad',
    'Fecha Creacion',
    'ID_TICKET'
];

const wb = XLSX.utils.book_new();

SHEET_NAMES.forEach(sheetName => {
    const ws = XLSX.utils.aoa_to_sheet([HEADERS]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
});

const filePath = path.join(__dirname, 'delivery_issues_template.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Excel file created at: ${filePath}`);
