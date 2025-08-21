const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // permite acceso desde cualquier origen
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
    console.log("Nuevo participante conectado:", socket.id);

    socket.on("join", ({ nombre }) => {
        console.log(`Se unió: ${nombre}`);
        io.emit("nuevo-participante", { nombre });
    });

    socket.on("mensaje", ({ nombre, texto }) => {
        console.log(`Mensaje de ${nombre}: ${texto}`);
        io.emit("nuevo-mensaje", { nombre, texto });
    });

    socket.on("disconnect", () => {
        console.log("Participante desconectado:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});

const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

let mensajes = [];

app.post("/enviar", (req, res) => {
  const { nombre, texto } = req.body;
  if (nombre && texto) {
    mensajes.push({ nombre, texto });
    res.status(200).send("Mensaje recibido");
  } else {
    res.status(400).send("Datos incompletos");
  }
});

app.get("/mensajes", (req, res) => {
  res.json(mensajes);
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

