const express = require('express');
const router = express.Router();
const { addRowToSheet } = require('./sheetsClient');
const { sendTicketNotification } = require('./emailService');

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

// Map of issue types to abbreviations for ticket ID
// Format: [ABBREVIATION][SEQUENTIAL_NUMBER] - Example: RE101
const ABBREVIATION_MAP = {
    'retraso_entrega': 'RE',           // RE = Retraso de Entrega
    'agilizacion_entrega': 'AG',       // AG = AGilización
    'visita_falso': 'VF',              // VF = Visita en Falso
    'dnr': 'DNR',                      // DNR = Delivery Not Recognized (Entrega No Reconocida)
    'paquete_no_deseado': 'PND',       // PND = Paquete No Deseado
    'envio_sin_actualizacion': 'ESA', // ESA = Envío Sin Actualización
    'entrega_erronea': 'EE',           // EE = Entrega Errónea
    'paquete_danado': 'PD',            // PD = Paquete Dañado
    'sustraccion': 'SUS',              // SUS = SUStracción
    'queja_operador': 'QO'             // QO = Queja al Operador
};

// Counter for sequential ticket numbers (in production, use database)
let ticketCounter = {};

/**
 * Generate a short ticket ID based on issue type
 * Format: [ABBREVIATION][SEQUENTIAL_NUMBER]
 * Example: PA123 for Pedido Atrasado (retraso_entrega)
 * @param {string} type - Issue type key
 * @returns {string} Generated ticket ID
 */
const generateTicketId = (type) => {
    const abbreviation = ABBREVIATION_MAP[type] || 'TK';

    // Initialize counter for this type if not exists
    if (!ticketCounter[type]) {
        ticketCounter[type] = Math.floor(Math.random() * 100) + 100; // Start from random 100-199
    }

    // Increment counter
    ticketCounter[type]++;

    return `${abbreviation}${ticketCounter[type]}`;
};

router.post('/tickets', async (req, res) => {
    try {
        const { type, guia, contacto, cedis_destino, agente_asignado, descripcion, prioridad } = req.body;

        if (!type || !SHEET_MAP[type]) {
            return res.status(400).json({ error: 'Invalid or missing ticket type' });
        }

        const sheetTitle = SHEET_MAP[type];
        const ticketId = generateTicketId(type); // Generate short ticket ID

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

        // Send email notification to customer if email is provided
        let emailResult = null;
        if (contacto?.correo) {
            emailResult = await sendTicketNotification({
                ticketId,
                type,
                typeName: sheetTitle,
                email: contacto.correo,
                nombre: contacto.nombre,
                guia,
                descripcion,
                prioridad: prioridad || 'Urgente'
            });
        }

        res.status(200).json({
            message: 'Ticket created successfully',
            type,
            sheet: sheetTitle,
            id_ticket: ticketId, // Return ID in response
            email_sent: emailResult?.success || false,
            email_message: emailResult?.success
                ? 'Notificación enviada al cliente'
                : (contacto?.correo ? 'Error al enviar notificación' : 'No se proporcionó correo del cliente')
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
