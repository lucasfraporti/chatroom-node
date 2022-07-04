const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Pegando o usuário e a sala pela URL
const {username, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// Entrando na sala do chat
socket.emit('joinRoom', {username, room});

// Pegando a sala e os usuários
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users);
});

// Mensagem do servidor
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Rolar para baixo toda vez que chega uma nova mensagem
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Envio de mensagem
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Capturando a mensagem
  let msg = e.target.elements.msg.value;
  msg = msg.trim();
  if(!msg){
    return false;
  }
  // Enviando uma mensagem para o servidor
  socket.emit('chatMessage', msg);
  // Limpando a mensagem do campo de mensagem e setando o foco pra ele
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Mensagem de saída para o DOM, enviando para o front
function outputMessage(message){
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span> ${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Adicionando o nome da sala para o DOM, enviando para o front
function outputRoomName(room){
  roomName.innerText = room;
}

// Adicionando os usuários para o DOM, enviando para o front
function outputUsers(users){
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

// Perguntando se o usuário tem certeza que quer sair da sala
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Você tem certeza que deseja sair da sala?');
  if(leaveRoom){
    window.location = '../index.html';
  }
});