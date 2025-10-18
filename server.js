import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
const server = createServer(app);
const io = new Server(server);
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "/app/index.html"));
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("🔌 New connection:", socket.id);

  socket.on("create-room", ({ username, roomId }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = username;

    console.log(`🟢 ${username} created room ${roomId}`);
    io.to(roomId).emit("update-users", rooms[roomId]);
  });

  socket.on("join-room", ({ username, roomId }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = username;

    console.log(`🟣 ${username} joined room ${roomId}`);

    // Notify existing peers that a new peer has joined (so they send offer)
    socket.to(roomId).emit("new-peer", { peerId: socket.id, username });

    io.to(roomId).emit("update-users", rooms[roomId]);
  });

  socket.on("signal", ({ roomId, target, type, data, from }) => {
    socket.to(target).emit("signal", { type, data, from });
  });

  socket.on("chat", ({ roomId, username, message }) => {
    io.to(roomId).emit("chat", { username, message });
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (rooms[roomId]) {
        delete rooms[roomId][socket.id];
        io.to(roomId).emit("update-users", rooms[roomId]);
      }
    }
    console.log(`❌ ${socket.id} disconnected`);
  });
});

server.listen(9000, () => {
  console.log("🚀 Server listening on port 9000");
});
