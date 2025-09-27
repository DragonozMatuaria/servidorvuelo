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
let usuarios = {};

io.on("connection", (socket) => {
  console.log("Nuevo participante conectado:", socket.id);

  // Guardar el userName relacionado con este socket
  let currentUser = null;

  socket.on("join", ({ userID }) => {
    console.log(`Se unió: ${userID}`);
    currentUser = userID;
    io.emit("nuevo-participante", { userID });
  });

  socket.on("mensaje", ({ userName, texto }) => {
    console.log(`Mensaje de ${userName}: ${texto}`);
    io.emit("nuevo-mensaje", { userName, texto });
  });

  socket.on("disconnect", () => {
    console.log("Participante desconectado:", socket.id);
    if (currentUser && usuarios[currentUser]) {
      delete usuarios[currentUser];
      io.emit("usuario-eliminado", { userName: currentUser });
    }
  });
});

// Endpoint para Unity (HTTP polling)
app.get("/mensajes", (req, res) => {
  const listaUsuarios = Object.values(usuarios);
  res.json(listaUsuarios);
});

// Endpoint para enviar datos
app.post("/enviar", (req, res) => {
  const { userName, userID, userVelocity, userDirection, userAltitud } = req.body;

  if (!userName) {
    return res.status(400).json({ error: "Faltan datos: userName es obligatorio" });
  }

  const participante = {
    userName,
    userID: userID || "0",
    userVelocity: userVelocity || "100",
    userDirection: userDirection || "0",
    userAltitud: userAltitud || "500"
  };

  // Actualiza o crea el usuario
  usuarios[userName] = participante;

  io.emit("nuevo-participante", participante);
  res.json({ ok: true });
});

// Endpoint para eliminar usuario
app.post("/eliminar", (req, res) => {
  const { userName } = req.body;
  if (userName && usuarios[userName]) {
    delete usuarios[userName];
    io.emit("usuario-eliminado", { userName });
  }
  res.json({ ok: true });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});


