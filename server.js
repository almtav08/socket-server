import { Server } from "socket.io";
import express from "express";

const app = express().listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});

const io = new Server(app, {
  cors: {
    origin: "*",
  },
});

const userRooms = {};
const userPlayerNumber = {};
const userPlayed = {};
let currentRoom = 1;

// Dos usuarios se conectan a la misma sala.
// Cada vez que un usuario emita el mensaje update, el otro de la misma room recibirá el mensaje move.
// Cuando los dos emitan el mensaje ready, se enviará un mensaje de ejecución.
// No hay limite de salas. Solo hay dos usuarios por sala. No hay limite de usuarios.
// Cuando un usuario entra por primera vez, se le asigna una sala y emite el mensaje de joined-room. Si la sala está llena, se crea una nueva.
// Cuando los dos usuarios se han unido a la sala, se emite un mensaje de room-ready.
// Cuando un usuario se desconecta, se elimina la sala.
io.on("connection", (socket) => {
  const user = socket.handshake.query.user;
  let room = `room-${currentRoom}`;
  const roomUsers = io.sockets.adapter.rooms.get(room)?.size || 0;
  if (!userRooms[user]) {
    if (roomUsers >= process.env.MAX_USERS_ROOM) {
      currentRoom++;
    }
    room = `room-${currentRoom}`;
    userRooms[user] = room;
    userPlayed[user] = false;
    userPlayerNumber[user] = roomUsers + 1;
    socket.join(room);
    socket.emit("joined-room", {
      room: userRooms[user],
      user: userPlayerNumber[user],
    });
  } else {
    socket.emit("joined-room", {
      room: userRooms[user],
      user: userPlayerNumber[user],
    });
  }

  console.log(
    `User ${user} connected to room ${room}. Total users connected ${
      io.sockets.adapter.rooms.get(userRooms[user])?.size
    } / ${process.env.MAX_USERS_ROOM}`
  );

  if (
    io.sockets.adapter.rooms.get(userRooms[user])?.size >=
    process.env.MAX_USERS_ROOM
  ) {
    console.log(`Room ${userRooms[user]} is ready`);
    io.to(userRooms[user]).emit("room-ready");
  }

  socket.on("update", (msg) => {
    socket.to(userRooms[user]).emit("move", msg);
  });

  socket.on("ready", () => {
    userPlayed[user] = true;
    console.log(`${user} is ready. Waiting for the other player.`);
    // Get all users of the same room as the user
    const currentUserRoom = userRooms[user];
    const usersInRoom = Object.keys(userRooms).filter(
      (u) => userRooms[u] === currentUserRoom
    );
    usersInRoom.forEach((u) => {
      console.log(
        `User ${u} ready: ${userPlayed[u]} in room ${currentUserRoom}`
      ); // Log user readiness
    });

    // Check if all users in the room are ready
    const allUsersReady = usersInRoom.every((u) => userPlayed[u]);
    if (allUsersReady && usersInRoom.length == process.env.MAX_USERS_ROOM) {
      io.to(userRooms[user]).emit("execute");
      console.log("Both players are ready. Executing...");
      usersInRoom.forEach((u) => {
        userPlayed[u] = false;
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User ${user} disconnected from room ${room}`);
    if (!io.sockets.adapter.rooms.get(room)) {
      let userCurrentRoom = userRooms[user];
      const otherUser = Object.keys(userRooms).find(
        (u) => u !== user && userRooms[u] === userCurrentRoom
      );
      delete userRooms[user];
      delete userRooms[otherUser];
      delete userPlayed[user];
      delete userPlayed[otherUser];
      console.log(`Room ${room} deleted`);
    }
  });
});
