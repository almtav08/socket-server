import { Server } from "socket.io";
import express from "express";

const app = express().listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});

const io = new Server(app, {
  cors: {
    origin: "*",
  },
  pingInterval: 86400000, // 24 horas (1 día)
  pingTimeout: 86400000, // 24 horas (1 día)
});

const userRooms = {};
const userPlayerNumber = {};
const userPlayed = {};
const userCar = {};
let currentRoom = 1;

// Dos usuarios se conectan a la misma sala.
// Cada vez que un usuario emita el mensaje update, el otro de la misma room recibirá el mensaje move.
// Cuando los dos emitan el mensaje ready, se enviará un mensaje de ejecución.
// No hay limite de salas. Solo hay dos usuarios por sala. No hay limite de usuarios.
// Cuando un usuario entra por primera vez, se le asigna una sala y emite el mensaje de joined-room. Si la sala está llena, se crea una nueva.
// Cuando los dos usuarios se han unido a la sala, se emite un mensaje de room-ready.
// Cuando un usuario se desconecta, se elimina la sala.
io.on("connection", (socket) => {
  // Obtenemos el usuario que se conecta y cuantos usuarios hay en la primera sala disponible.
  const user = socket.handshake.query.user;
  let room = `room-${currentRoom}`;
  const roomUsers = io.sockets.adapter.rooms.get(room)?.size || 0;

  // Si el tamaño de la sala es mayor o igual al máximo de usuarios por sala, se crea una nueva sala.
  // if (roomUsers >= process.env.MAX_USERS_ROOM) {
  //   currentRoom++;
  //   room = `room-${currentRoom}`;
  //   roomUsers = 0;
  // }

  // El jugador se conecta a la sala correspondiente. Se le asigna un número de jugador y se une a la sala.
  userRooms[user] = room;
  userPlayed[user] = false;
  userPlayerNumber[user] = roomUsers + 1;
  socket.join(room);
  socket.emit("joined-room", {
    room: userRooms[user],
    user: userPlayerNumber[user],
  });
  console.log(
    `User ${user} connected to room ${room}. Total users connected ${
      io.sockets.adapter.rooms.get(userRooms[user])?.size
    } / ${process.env.MAX_USERS_ROOM}`
  );

  // Cuando la sala está llena, se emite un mensaje de room-ready. Se actualiza el numero de sala.
  if (
    io.sockets.adapter.rooms.get(userRooms[user])?.size >=
    process.env.MAX_USERS_ROOM
  ) {
    console.log(`Room ${userRooms[user]} is ready`);
    io.to(userRooms[user]).emit("room-ready");
    currentRoom++;
  }

  // El primer jugador que se conecta a la sala debe decidir el nivel que se va a jugar.
  socket.on("select-level", (level) => {
    console.log(`User ${user} selected level ${level}`);
    io.to(userRooms[user]).emit("level", level);
  });

  // Esperar a que los dos jugadores completen el coche.
  socket.on("car-ready", () => {
    userCar[user] = true;
    console.log(`${user} car is ready. Waiting for the other player.`);
    // Get all users of the same room as the usercle
    const currentUserRoom = userRooms[user];
    const usersInRoom = Object.keys(userRooms).filter(
      (u) => userRooms[u] === currentUserRoom
    );
    usersInRoom.forEach((u) => {
      console.log(`User ${u} ready: ${userCar[u]} in room ${currentUserRoom}`); // Log user readiness
    });

    // Check if all users in the room are ready
    const allUsersReady = usersInRoom.every((u) => userCar[u]);
    if (allUsersReady && usersInRoom.length == process.env.MAX_USERS_ROOM) {
      io.to(userRooms[user]).emit("start-game");
      console.log("Both players' car are ready. Starting...");
      usersInRoom.forEach((u) => {
        userCar[u] = false;
      });
    }
  });

  // Cuando un jugador añade bloques, se envía un mensaje al otro jugador de la sala.
  socket.on("update", (msg) => {
    socket.to(userRooms[user]).emit("move", msg);
  });

  // Cuando un jugador está listo, se actualiza el estado de la sala y se comprueba si ambos jugadores están listos.
  // Si ambos están listos, se envía un mensaje para ejecutar el código.
  socket.on("ready", () => {
    userPlayed[user] = true;
    console.log(`${user} is ready. Waiting for the other player.`);
    // Get all users of the same room as the usercle
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

  // Cuando los jugadores de la sala se desconectan se elimina la sala.
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

  // Reconnect User
  socket.on("reconnect", () => {
    console.log(`User ${user} reconnected to room ${userRooms[user]}`);
    socket.join(userRooms[user]);
    socket.emit("joined-room", {
      room: userRooms[user],
      user: userPlayerNumber[user],
    });
  });

  // Get possible errors from the user
  socket.on("error", (err) => {
    console.error(`Socket error: ${err.message}`);
  });
});
