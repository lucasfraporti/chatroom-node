const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {formatMessage, formatMessageRoomEnter, formatMessageRoomExit} = require("./utils/messages");
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Importando a pasta do front
app.use(express.static(path.join(__dirname, "public")));

const botName = "Sistema 🤖";

// Irá executar quando um cliente se conectar no servidor
io.on("connection", (socket) => {
    socket.on("joinRoom", ({username, room}) => {
        // Entrando na sala e configurando o usuário no socket.io
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // Unicast pois é uma mensagem para um usuário específico
        socket.emit("message", formatMessage(botName, "Olá, utilize o nosso chat com moderação!", room));

        // Broadcast quando um usuário se conectar, emitindo uma mensagem para todos usuários da sala específica menos o usuário que está conectando
        socket.broadcast
        .to(user.room)
        .emit(
            "message",
            formatMessageRoomEnter(botName, `${user.username}`, room)
        );

        // Enviando pro servidor as informações da sala e do usuário
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Procurando por uma mensagem
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg, user.room));

        // Bot alerta o usuário específico para não mandar palavrões
        let bad_words = ["bobo", "boba"];
        for(i in bad_words){
            if(msg.toLowerCase().includes(bad_words[i])){
                // Unicast
                socket.emit("message", formatMessage(botName, "Pare de falar palavrões, seja mais educado! 🤫", user.room));
            }
        }

        // Bot agradece o usuário específico pelos elogios
        let good_words = ["lindo", "linda"];
        for(i in good_words){
            if(msg.toLowerCase().includes(good_words[i])){
                // Unicast
                socket.emit("message", formatMessage(botName, "Obrigado, são seus olhos! 😍", user.room));
            }
        }
    });

    // Executado quando o cliente se desconecta
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if(user){
        io.to(user.room).emit(
            "message",
            formatMessageRoomExit(botName, `${user.username}`, user.room)
        );

        // Enviando as informações do usuário e da sala
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));