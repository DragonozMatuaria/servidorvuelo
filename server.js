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
let usuarios = {};           // socket.id → datos del usuario
let mensajes = [];           // historial opcional

io.on("connection", (socket) => {
  console.log("🟢 Conectado:", socket.id);

  socket.on("join", ({ userName }) => {
    console.log(`Se unió: ${userName}`);

    usuarios[socket.id] = {
      userName,
      userID: socket.id,
      userVelocity: "100",
      userDirection: "0",
      userAltitud: "500"
    };

    io.emit("nuevo-participante", usuarios[socket.id]);
  });

  socket.on("mensaje", ({ texto }) => {
    const user = usuarios[socket.id];
    if (user) {
      console.log(`Mensaje de ${user.userName}: ${texto}`);
      mensajes.push({ userName: user.userName, texto });
      io.emit("nuevo-mensaje", { userName: user.userName, texto });
    }
  });

  socket.on("actualizar", ({ userVelocity, userDirection, userAltitud }) => {
    if (usuarios[socket.id]) {
      usuarios[socket.id].userVelocity = userVelocity || "100";
      usuarios[socket.id].userDirection = userDirection || "0";
      usuarios[socket.id].userAltitud = userAltitud || "500";
      io.emit("nuevo-participante", usuarios[socket.id]);
    }
  });

  socket.on("disconnect", () => {
    const user = usuarios[socket.id];
    if (user) {
      console.log(`🔴 Desconectado: ${user.userName} (${socket.id})`);
      delete usuarios[socket.id];
      io.emit("usuario-desconectado", { userID: socket.id });
    }
  });
});

// Endpoint para Unity (HTTP polling)
app.get("/mensajes", (req, res) => {
  const listaUsuarios = Object.values(usuarios);
  res.json(listaUsuarios);
});

// ⚠️ Este endpoint no debe sobrescribir usuarios[socket.id] si no viene del socket
app.post("/enviar", (req, res) => {
  const { userName, userID, userVelocity, userDirection, userAltitud } = req.body;

  if (!userID || !userName) {
    return res.status(400).json({ error: "Faltan datos: userID y userName son obligatorios" });
  }

  // Solo actualiza si el userID coincide con un socket activo
  if (usuarios[userID]) {
    usuarios[userID].userVelocity = userVelocity || "100";
    usuarios[userID].userDirection = userDirection || "0";
    usuarios[userID].userAltitud = userAltitud || "500";
    io.emit("nuevo-participante", usuarios[userID]);
  }

  res.json({ ok: true });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
