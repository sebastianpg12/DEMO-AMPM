const nodemailer = require('nodemailer');

// Create transporter using environment variables
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

/**
 * Send ticket creation notification email to customer
 * @param {Object} ticketData - Ticket information
 * @param {string} ticketData.ticketId - The generated ticket ID
 * @param {string} ticketData.type - Type of issue
 * @param {string} ticketData.typeName - Human readable type name
 * @param {string} ticketData.email - Customer email
 * @param {string} ticketData.nombre - Customer name
 * @param {string} ticketData.guia - Tracking number
 * @param {string} ticketData.descripcion - Issue description
 * @param {string} ticketData.prioridad - Priority level
 */
const sendTicketNotification = async (ticketData) => {
    const transporter = createTransporter();

    const { ticketId, typeName, email, nombre, guia, descripcion, prioridad } = ticketData;

    const mailOptions = {
        from: `"Soporte de Entregas" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `✅ Ticket Creado: ${ticketId} - ${typeName}`,
        html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 40px 0; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📦 Ticket Creado Exitosamente</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px; background-color: #ffffff;">
                            <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
                                Hola <strong>${nombre || 'Estimado Cliente'}</strong>,
                            </p>
                            <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
                                Tu ticket ha sido creado exitosamente. A continuación encontrarás los detalles de tu solicitud:
                            </p>
                            
                            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8f9fa; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 15px; border-bottom: 1px solid #e9ecef;">
                                        <strong style="color: #667eea;">🎫 ID del Ticket:</strong>
                                    </td>
                                    <td style="padding: 15px; border-bottom: 1px solid #e9ecef; font-size: 18px; font-weight: bold; color: #333;">
                                        ${ticketId}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px; border-bottom: 1px solid #e9ecef;">
                                        <strong style="color: #667eea;">📋 Tipo de Incidencia:</strong>
                                    </td>
                                    <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #333;">
                                        ${typeName}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px; border-bottom: 1px solid #e9ecef;">
                                        <strong style="color: #667eea;">📦 Número de Guía:</strong>
                                    </td>
                                    <td style="padding: 15px; border-bottom: 1px solid #e9ecef; color: #333;">
                                        ${guia || 'N/A'}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px; border-bottom: 1px solid #e9ecef;">
                                        <strong style="color: #667eea;">⚡ Prioridad:</strong>
                                    </td>
                                    <td style="padding: 15px; border-bottom: 1px solid #e9ecef;">
                                        <span style="background-color: ${prioridad === 'Urgente' ? '#dc3545' : prioridad === 'Alta' ? '#fd7e14' : '#28a745'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
                                            ${prioridad || 'Normal'}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px;" colspan="2">
                                        <strong style="color: #667eea;">📝 Descripción:</strong>
                                        <p style="margin: 10px 0 0 0; color: #555; line-height: 1.6;">
                                            ${descripcion || 'Sin descripción adicional'}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="font-size: 14px; color: #666666; margin: 20px 0 0 0;">
                                Nuestro equipo está trabajando en tu solicitud. Te contactaremos pronto con actualizaciones.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #333333; text-align: center;">
                            <p style="color: #ffffff; margin: 0; font-size: 14px;">
                                © ${new Date().getFullYear()} Servicio de Entregas. Todos los derechos reservados.
                            </p>
                            <p style="color: #999999; margin: 10px 0 0 0; font-size: 12px;">
                                Este es un correo automático, por favor no responda a este mensaje.
                            </p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email notification sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email notification:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendTicketNotification };
