import express from 'express'
import bodyParser from 'body-parser'
import 'dotenv/config'
import twilio from 'twilio'
import cors from 'cors'

const app = express()
app.use(cors())
const port = 3000

app.use(bodyParser.json())

// Credenciales de Twilio
const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.ACCES_TOKEN
const client = new twilio(accountSid, authToken)

// Ruta para enviar mensajes
app.post('/sendmessage', async (req, res) => {
  const { empleados } = req.body
  if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
    return res.status(400).json({ success: false, message: 'No se proporcionaron empleados válidos.' })
  }
  try {
    const resultados = await Promise.allSettled(
      empleados.map(async (empleado) => {
        try {
          const mensaje = `Hola ${empleado.nombre}, tu monto actual es $${empleado.monto} y tu sueldo disponible es $${empleado.sueldoDisponible}.`
          const response = await client.messages.create({
            body: mensaje,
            from: '+12313994209',
            to: empleado.telefono,
          })
          return { empleado: empleado.nombre, status: 'enviado', sid: response.sid }
        } catch (error) {
          return { empleado: empleado.nombre, status: 'error', error: error.message }
        }
      })
    )

    res.status(200).json({ success: true, message: 'Mensajes procesados', detalles: resultados })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
})
