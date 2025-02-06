import cron from 'node-cron'
import twilio from 'twilio'
import { empleados } from '../../data'  // Supongo que tienes un archivo de datos con los empleados

const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.ACCES_TOKEN
const client = new twilio(accountSid, authToken)

cron.schedule('0 1 * * *', () => {
  empleados.forEach(empleado => {
    const mensaje = `Hola ${empleado.nombre}, tu monto actual es $${empleado.monto} y tu sueldo disponible es $${empleado.sueldoDisponible}. ES UNA PRUEBA MIA NO SE ASUSTEN.`

    client.messages.create({
      body: mensaje,
      from: '+15405180908',  // Tu número de Twilio
      to: empleado.telefono
    })
    .then(message => console.log(`Mensaje enviado a ${empleado.nombre} con SID:`, message.sid))
    .catch(error => console.error('Error al enviar el mensaje:', error))
  })
})
