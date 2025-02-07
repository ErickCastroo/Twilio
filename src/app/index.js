import express from 'express';
import bodyParser from 'body-parser';
import 'dotenv/config';
import twilio from 'twilio';
import cors from 'cors';

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());

// Credenciales de Twilio
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.ACCES_TOKEN;
const client = new twilio(accountSid, authToken);

// Ruta para enviar mensajes
app.post('/sendmessage', async (req, res) => {
  const { empleados } = req.body;

  // Validación de los datos recibidos
  if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
    return res.status(400).json({ success: false, message: 'No se proporcionaron empleados válidos.' });
  }

  try {
    const resultados = await Promise.allSettled(
      empleados.map(async (empleado) => {
        try {
          // Validación de campos requeridos
          if (!empleado.nombre || !empleado.telefono || empleado.monto === undefined || empleado.sueldoDisponible === undefined) {
            return { empleado: empleado.nombre, status: 'error', error: 'Datos incompletos' };
          }

          const mensaje = `Hola ${empleado.nombre}, tu monto actual es $${empleado.monto} y tu sueldo disponible es $${empleado.sueldoDisponible}.`;
          const response = await client.messages.create({
            body: mensaje,
            from: '+15512829877', // Número de Twilio
            to: empleado.telefono,
          });

          console.log(`Mensaje enviado a ${empleado.telefono}:`, response.sid); // Log para depuración
          return { empleado: empleado.nombre, status: 'enviado', sid: response.sid };
        } catch (error) {
          console.error(`Error al enviar mensaje a ${empleado.telefono}:`, error.message); // Log para depuración
          return { empleado: empleado.nombre, status: 'error', error: error.message };
        }
      })
    );

    res.status(200).json({ success: true, message: 'Mensajes procesados', detalles: resultados });
  } catch (error) {
    console.error('Error en la petición de Twilio:', error.message); // Log para depuración
    res.status(500).json({ success: false, error: error.message });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});