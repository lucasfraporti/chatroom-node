const moment = require('moment');

function formatMessage(username, text, room){
    // Mural para o envio de mensagem em geral
    console.log(`[${moment().format('H:m')}] - [${room}] - ${username}: ${text}`);
    return {
        username,
        text,
        time: moment().format('H:m')
    };
};

function formatMessageRoomEnter(username, text, room){
    // Mural para o envio de mensagem de entrada na sala
    console.log(`[${moment().format('H:m')}] - [${room}] - ${username}: ${text} entrou na sala.`);
    var text = `${text} entrou na sala.`;
    return {
        username,
        text,
        time: moment().format('H:m')
    };
}

function formatMessageRoomExit(username, text, room){
    // Mural para o envio de mensagem de saída da sala
    console.log(`[${moment().format('H:m')}] - [${room}] - ${username}: ${text} saiu da sala.`);
    var text = `${text} saiu da sala.`;
    return {
        username,
        text,
        time: moment().format('H:m')
    };
}

module.exports = {
    formatMessage,
    formatMessageRoomEnter,
    formatMessageRoomExit
};
