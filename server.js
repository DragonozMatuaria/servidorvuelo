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