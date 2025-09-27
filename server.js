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
let usuarios = {}; // clave: userID

io.on("connection", (socket) => {
  console.log("Nuevo participante conectado:", socket.id);

  // Guardar el userID temporal de este socket
  let currentUserID = null;

  socket.on("join", ({ userID, userName }) => {
    console.log(`Conexión establecida: ${userName} (${userID})`);
    currentUserID = userID;
    // NO agregar al array aún
  });

  socket.on("disconnect", () => {
    console.log("Participante desconectado:", socket.id);
    if (currentUserID && usuarios[currentUserID]) {
      delete usuarios[currentUserID];
      io.emit("usuario-eliminado", { userID: currentUserID });
    }
  });
});

// Endpoint para enviar datos desde el formulario
app.post("/enviar", (req, res) => {
  const { userID, userName, userVelocity, userDirection, userAltitud } = req.body;

  if (!userID || !userVelocity || !userDirection || !userAltitud) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const participante = {
    userID,
    userName,
    userVelocity,
    userDirection,
    userAltitud
  };

  // Ahora sí agregamos/actualizamos al usuario
  usuarios[userID] = participante;
  io.emit("nuevo-participante", participante);

  res.json({ ok: true });
});

// Endpoint para eliminar usuario
app.post("/eliminar", (req, res) => {
  const { userID } = req.body;
  if (userID && usuarios[userID]) {
    delete usuarios[userID];
    io.emit("usuario-eliminado", { userID });
  }
  res.json({ ok: true });
});

// Endpoint de polling para Unity
app.get("/mensajes", (req, res) => {
  res.json(Object.values(usuarios));
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
