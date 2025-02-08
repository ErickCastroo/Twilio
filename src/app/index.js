import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import twilio from "twilio";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.ACCESS_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE;

if (!accountSid || !authToken || !twilioNumber) {
  console.error("Error: Credenciales de Twilio no configuradas correctamente.");
  process.exit(1);
}

const client = twilio(accountSid, authToken);

// 📝 Mensajes predeterminados con placeholders
const mensajesPredeterminados = {
  descuento:
    "Hola {nombre}, te ofrecemos un descuento especial en nuestros servicios. Tu saldo pendiente es de *${saldoPendiente}* y la fecha de corte es el *{fechaCorte}*.",
  aviso:
    "Hola {nombre}, este es un aviso importante sobre nuestros servicios. Tu saldo pendiente es de *${saldoPendiente}* y la fecha de corte es el *{fechaCorte}*.",
};

// Función para reemplazar placeholders con valores reales
const generarMensaje = (plantilla, datos) => {
  return plantilla
    .replace("{nombre}", datos.nombre)
    .replace("{saldoPendiente}", datos.saldoPendiente)
    .replace("{fechaCorte}", datos.fechaCorte);
};

app.post("/sendmessage", async (req, res) => {
  try {
    const { empleados, mensajePersonalizado, mensajeSeleccionado } = req.body;

    if (!Array.isArray(empleados) || empleados.length === 0) {
      return res.status(400).json({ error: "Lista de empleados inválida." });
    }

    const mensajes = empleados.map(async (empleado) => {
      // Determinar el mensaje a enviar
      let mensaje =
        mensajePersonalizado || mensajesPredeterminados[mensajeSeleccionado];
      if (!mensaje) {
        return {
          empleado: empleado.nombre,
          status: "fallido",
          error: "Mensaje no disponible.",
        };
      }

      // Reemplazar los placeholders con los valores del empleado
      const mensajeFinal = generarMensaje(mensaje, empleado);

      try {
        await client.messages.create({
          body: mensajeFinal,
          from: twilioNumber,
          to: empleado.telefono,
        });
        return {
          empleado: empleado.nombre,
          status: "enviado",
          mensaje: mensajeFinal, // Incluimos el mensaje enviado en la respuesta
        };
      } catch (error) {
        console.error(`Error enviando mensaje a ${empleado.nombre}:`, error);
        return {
          empleado: empleado.nombre,
          status: "fallido",
          error: error.message,
        };
      }
    });

    const resultados = await Promise.allSettled(mensajes);
    const detalles = resultados.map((resultado) => resultado.value);
    res.json({ detalles });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
