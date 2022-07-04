const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Importando a pasta do front
app.use(express.static(path.join(__dirname, 'public')));

const botName = "Admin";

// Irá executar quando um cliente se conectar
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        // Entrando na sala e configurando o usuário no socket.io
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // Mensagem para o usuário atual
        socket.emit('message', formatMessage(botName, 'Olá, utilize o nosso chat com moderação!'))

        // Broadcast quando um usuário se conectar
        // Emite a mensagem para todos da sala específica menos para o usuário que está se conectando
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `O usuário (${user.username}) se conectou ao chat.`));

        // Enviando as informações do usuário e da sala
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Procurando por uma mensagem
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Executado quando o cliente se desconecta
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `O usuário (${user.username}) acabou de sair do chat.`));

            // Enviando informações dos usuários e da sala
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));