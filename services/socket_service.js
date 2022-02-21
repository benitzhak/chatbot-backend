const { Server } = require("socket.io");
const botService = require("../api/bot/bot-service");


function connectSocket(server) {
  let timer;
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });
  
  io.on("connection", (socket) => {
    console.log("new connection", socket.id);

    socket.on("join-room", (data) => {
      socket.join(data);
      console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    socket.on("typing", (room) => {
      clearTimeout(timer)
      timer = setTimeout(()=> {
        const botAnswer = botService.quietInTheRoom(room);
        socket.emit("bot-message", botAnswer);
        socket.to(room).emit("bot-message", botAnswer);
      },8000)
        socket.broadcast.emit("other-typing");
    })
    
    socket.on("send-message", async (data) => {
      clearTimeout(timer)
      const botAnswer = await botService.checkAnswer(data.message);
      socket.to(data.room).emit("receive-message", data);
      if (botAnswer) {
        socket.emit("bot-message", botAnswer);
        socket.to(data.room).emit("bot-message", botAnswer);
      }
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });
}

module.exports = {
  connectSocket,
};
