const WebSocket = require("ws");
const server = new WebSocket.Server({ port: process.env.PORT || 3000 });

server.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("message", (data) => {
    const msg = JSON.parse(data);
    console.log("Mensaje recibido:", msg);

    if (msg.type === "join") {
      broadcast({ type: "nuevo-participante", nombre: msg.nombre });
    } else if (msg.type === "mensaje") {
      broadcast({ type: "nuevo-mensaje", nombre: msg.nombre, texto: msg.texto });
    }
  });

  socket.on("close", () => {
    console.log("Cliente desconectado");
  });
});

function broadcast(data) {
  const json = JSON.stringify(data);
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}
