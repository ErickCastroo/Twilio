import express from 'express';
import bodyParser from 'body-parser';
import 'dotenv/config';
import twilio from 'twilio';
import cors from 'cors';


const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());

// Tus credenciales de Twilio
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.ACCES_TOKEN;
const client = new twilio(accountSid, authToken);

// Empleados (puedes guardar esto en una base de datos)
let empleados = [
  {
    nombre: 'Erick Castro',
    monto: 1200,
    sueldoDisponible: 2000,
    telefono: '+526313446741',
  },
];

// Ruta para enviar SMS
app.post('/sendmessage', (req, res) => {
  empleados.forEach(empleado => {
    const mensaje = `Hola ${empleado.nombre}, tu monto actual es $${empleado.monto} y tu sueldo disponible es $${empleado.sueldoDisponible}. ES UNA PRUEBA MIA NO SE ASUSTEN.`;

    client.messages.create({
      body: mensaje,
      from: '+15405180908',
      to: empleado.telefono,
    })
    .then(message => res.status(200).json({ success: true, messageSid: message.sid }))
    .catch(error => res.status(500).json({ success: false, error: error.message }));
  });
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
