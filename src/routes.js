const { v4: uuidv4 } = require('uuid');
const express = require('express');
const router = express.Router();
const { addRowToSheet } = require('./sheetsClient');

// Map of issue types to sheet names
const SHEET_MAP = {
    'retraso_entrega': 'Retraso de entrega',
    'agilizacion_entrega': 'Agilización de entrega',
    'visita_falso': 'Visita en falso',
    'dnr': 'DNR',
    'paquete_no_deseado': 'Paquete no deseado',
    'envio_sin_actualizacion': 'Envío sin actualización',
    'entrega_erronea': 'Entrega errónea',
    'paquete_danado': 'Paquete dañado',
    'sustraccion': 'Sustracción',
    'queja_operador': 'Queja al operador'
};

router.post('/tickets', async (req, res) => {
    try {
        const { type, guia, contacto, cedis_destino, agente_asignado, descripcion, prioridad } = req.body;

        if (!type || !SHEET_MAP[type]) {
            return res.status(400).json({ error: 'Invalid or missing ticket type' });
        }

        const sheetTitle = SHEET_MAP[type];
        const ticketId = uuidv4(); // Generate unique ticket ID

        const rowData = {
            'Guia': guia,
            'Nombre Contacto': contacto?.nombre || '',
            'Telefono Contacto': contacto?.telefono || '',
            'Correo Contacto': contacto?.correo || '',
            'Cedis Destino': cedis_destino,
            'Agente Asignado': agente_asignado,
            'Descripcion': descripcion,
            'Prioridad': prioridad || 'Urgente',
            'Fecha Creacion': new Date().toISOString(),
            'ID_TICKET': ticketId // Add ID to row data
        };

        await addRowToSheet(sheetTitle, rowData);

        res.status(200).json({
            message: 'Ticket created successfully',
            type,
            sheet: sheetTitle,
            id_ticket: ticketId // Return ID in response
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
