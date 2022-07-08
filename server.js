const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Importando a pasta do front
app.use(express.static(path.join(__dirname, "public")));

const botName = "Sistema 🤖";

// Irá executar quando um cliente se conectar
io.on("connection", (socket) => {
    socket.on("joinRoom", ({username, room}) => {
        // Entrando na sala e configurando o usuário no socket.io
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // Unicast
        // Mensagem para um usuário específico
        socket.emit("message", formatMessage(botName, "Olá, utilize o nosso chat com moderação!"));

        // Broadcast quando um usuário se conectar
        // Emite a mensagem para todos da sala específica menos para o usuário que está se conectando
        socket.broadcast
        .to(user.room)
        .emit(
            "message",
            formatMessage(botName, `${user.username} entrou no chat.`)
        );

        // Enviando as informações do usuário e da sala
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });

    // Procurando por uma mensagem
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));

        // Bot alerta o usuário específico para não mandar palavrões
        let bad_words = ['bobo', 'boba'];
        for(i in bad_words){
            if(msg.toLowerCase() == bad_words[i]){
                // Unicast
                socket.emit('message', formatMessage(botName, 'Pare de falar palavrões, seja mais educado! 🤫'));
            }
        }

        // Bot agradece o usuário específico pelos elogios
        let good_words = ['lindo', 'linda'];
        for(i in good_words){
            if(msg.toLowerCase() == good_words[i]){
                // Unicast
                socket.emit('message', formatMessage(botName, 'Obrigado, são seus olhos! 😍'));
            }
        }
    });

    // Executado quando o cliente se desconecta
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if(user){
        io.to(user.room).emit(
            "message",
            formatMessage(botName, `${user.username} saiu do chat.`)
        );

        // Enviando as informações do usuário
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));