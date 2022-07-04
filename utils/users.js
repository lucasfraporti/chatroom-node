const users = [];

// Entrando usuários no chat
function userJoin(id, username, room){
    const user = {id, username, room};
    users.push(user);
    return user;
}

// Pegando o usuário atual
function getCurrentUser(id){
    return users.find(user => user.id === id);
}

// Usuário saindo do chat
function userLeave(id){
    const index = users.findIndex(user => user.id === id);
    if(index !== -1){
        return users.slice(index, 1)[0];
    }
}

// Pegar a sala do usuário
function getRoomUsers(room){
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}