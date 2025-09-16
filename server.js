const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
let mensajes = [];

io.on("connection", (socket) => {
  console.log("Nuevo participante conectado:", socket.id);

  socket.on("join", ({ userName }) => {
    console.log(`Se unió: ${nombre}`);
    io.emit("nuevo-participante", { userName });
  });

  socket.on("mensaje", ({ userName, texto }) => {
    console.log(`Mensaje de ${userName}: ${texto}`);
    mensajes.push({ userName, texto }); // Guardamos para polling
    io.emit("nuevo-mensaje", { userName, texto });
  });

  socket.on("disconnect", () => {
    console.log("Participante desconectado:", socket.id);
  });
});

// Endpoint para Unity (HTTP polling)
app.get("/mensajes", (req, res) => {
  res.json(mensajes);
});

app.post("/enviar", (req, res) => {
  const { userName, userVelocity, userDirection, userAltitud } = req.body;
  if (!userName) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const participante = { 
    userName, 
    userVelocity: userVelocity || 100, 
    userDirection: userDirection || 0, 
    userAltitud: userAltitud || 500 
  };

  mensajes.push(participante);

  io.emit("nuevo-participante", participante); // por si luego quieres sockets
  res.json({ ok: true });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});





