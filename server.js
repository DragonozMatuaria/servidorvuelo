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

  socket.on("join", ({ nombre }) => {
    console.log(`Se unió: ${nombre}`);
    io.emit("nuevo-participante", { nombre });
  });

  socket.on("mensaje", ({ nombre, texto }) => {
    console.log(`Mensaje de ${nombre}: ${texto}`);
    mensajes.push({ nombre, texto }); // Guardamos para polling
    io.emit("nuevo-mensaje", { nombre, texto });
  });

  socket.on("disconnect", () => {
    console.log("Participante desconectado:", socket.id);
  });
});

// Endpoint para Unity (HTTP polling)
app.get("/mensajes", (req, res) => {
  res.json(mensajes);
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});


