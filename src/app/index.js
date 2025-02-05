import twilio from 'twilio'
import 'dotenv/config'

// Tus credenciales de Twilio
const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.ACCES_TOKEN

// Crea una instancia del cliente Twilio
const client = new twilio(accountSid, authToken)

const empleados = [
  {
    nombre: 'Erick Castro',
    monto: 1200,
    sueldoDisponible: 2000,
    telefono: '+526313446741'
  },
]


// Enviar mensaje a cada empleado
empleados.forEach(empleado => {
  const mensaje = `Hola ${empleado.nombre}, tu monto actual es $${empleado.monto} y tu sueldo disponible es $${empleado.sueldoDisponible}. ES UNA PRUEBA MIA NO SE ASUSTEN.`

  client.messages.create({
    body: mensaje,
    from: 'NumeroTwilio',  // Tu número de Twilio
    to: empleado.telefono  // Usamos el número de teléfono de cada empleado
  })
  .then(message => console.log(`Mensaje enviado a ${empleado.nombre} con SID:`, message.sid))
  .catch(error => console.error('Error al enviar el mensaje:', error))
})