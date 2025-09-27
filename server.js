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
let usuarios = {};           // userID → datos del usuario
let conexiones = {};         // socket.id → userID
let mensajes = [];           // historial de mensajes opcional

io.on("connection", (socket) => {
  console.log("🟢 Conectado:", socket.id);

  socket.on("join", ({ userID }) => {
    console.log(`Se unió: ${userID}`);
    conexiones[socket.id] = userID;
    io.emit("nuevo-participante", { userID });
  });

  socket.on("mensaje", ({ userID, texto }) => {
    console.log(`Mensaje de ${userID}: ${texto}`);
    mensajes.push({ userID, texto });
    io.emit("nuevo-mensaje", { userID, texto });
  });

  socket.on("disconnect", () => {
    const userID = conexiones[socket.id];
    console.log("🔴 Desconectado:", socket.id, userID);

    if (userID && usuarios[userID]) {
      delete usuarios[userID];
      console.log(`🧹 Eliminado usuario ${userID}`);
      io.emit("usuario-desconectado", { userID });
    }

    delete conexiones[socket.id];
  });
});

// Endpoint para Unity (HTTP polling)
app.get("/mensajes", (req, res) => {
  const listaUsuarios = Object.values(usuarios);
  res.json(listaUsuarios);
});

app.post("/enviar", (req, res) => {
  const { userName, userID, userVelocity, userDirection, userAltitud } = req.body;

  if (!userID || !userName) {
    return res.status(400).json({ error: "Faltan datos: userID y userName son obligatorios" });
  }

  const participante = {
    userName,
    userID,
    userVelocity: userVelocity || "100",
    userDirection: userDirection || "0",
    userAltitud: userAltitud || "500"
  };

  usuarios[userID] = participante;

  io.emit("nuevo-participante", participante);
  res.json({ ok: true });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});








