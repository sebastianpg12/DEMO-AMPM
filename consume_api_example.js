// URL de la API desplegada en Render
const API_URL = "https://demo-ampm.onrender.com/api/tickets";

try {
    // Se asume que 'args' está disponible en el entorno (ej. HubSpot Custom Code)
    // args debe contener: type, guia, nombre, telefono, correo, cedis_destino, agente_asignado, descripcion, prioridad

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            // Mapeo directo de los argumentos a la estructura que espera la API
            type: args.type, // Ej: 'retraso_entrega', 'dnr', etc.
            guia: args.guia,
            contacto: {
                nombre: args.nombre,
                telefono: args.telefono,
                correo: args.correo
            },
            cedis_destino: args.cedis_destino,
            agente_asignado: args.agente_asignado,
            descripcion: args.descripcion,
            prioridad: args.prioridad // Opcional, por defecto 'Urgente' en la API si no se envía
        })
    });

    if (!response.ok) {
        throw new Error(`Error en API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Retornamos la respuesta (incluye el ID_TICKET generado)
    return data;

} catch (error) {
    console.error("Error al crear el ticket:", error);
    // Retornar el error para que sea visible en el log del sistema que ejecuta esto
    throw error;
}
