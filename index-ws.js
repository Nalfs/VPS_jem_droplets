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
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });
process.on("SIGINT", () => {
  wss.clients.forEach(function each(client) {
    client.close();
  });

  console.log("Shutting down db");
  shutdownDB(() => {
    process.exit(0);
  });
});

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log(`New client connected. Total clients: ${numClients}`);
  wss.broadcast(`A new client has connected. Total clients: ${numClients}`);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send("Welcome to the WebSocket server!");
  }

  db.run(
    `INSERT INTO visitors(count, time)
    VALUES(${numClients}, datetime('now'))`
  );
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

/** sqlite3 setup */

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(":memory:");
db.serialize(() => {
  db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
        `);
});

function getCounts(done) {
  db.each(
    "SELECT * FROM visitors",
    (err, row) => {
      if (err) console.error(err);
      else console.log(row);
    },
    (err) => {
      if (err) console.error(err);
      if (done) done();
    }
  );
}

function shutdownDB(done) {
  getCounts(() => {
    db.close((err) => {
      if (err) console.error(err.message);
      else console.log("Closed the database connection.");
      if (done) done();
    });
  });
}
