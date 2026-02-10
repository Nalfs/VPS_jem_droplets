/** Server setup */
const express = require("express");
const server = require("http").createServer();
const app = express();

app.get("/", function (req, res) {
  res.sendFile("/index.html", { root: __dirname });
});

server.on("request", app);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
/** Websocket setup */
const WebSocket = require("ws").Server;

const wss = new WebSocket({ server: server });

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log(`New client connected. Total clients: ${numClients}`);
  wss.broadcast(`A new client has connected. Total clients: ${numClients}`);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send("Welcome to the WebSocket server!");
  }
  ws.on("close", function close() {
    const numClients = wss.clients.size;
    console.log(`Client disconnected. Total clients: ${numClients}`);
    wss.broadcast(`A client has disconnected. Total clients: ${numClients}`);
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};
