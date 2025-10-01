// Variáveis globais
let currentUser = null;
let currentRoom = null;
let messagesRef = null;
let presenceRef = null;
let userColor = null;

// Elementos do DOM
const roomScreen = document.getElementById('roomScreen');
const chatArea = document.getElementById('chatArea');
const createRoomInput = document.getElementById('createRoomInput');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomInput = document.getElementById('joinRoomInput');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesDiv = document.getElementById('messages');
const roomNameSpan = document.getElementById('roomName');
const roomInfo = document.getElementById('roomInfo');
const onlineCountSpan = document.getElementById('onlineCount');
const copyLinkBtn = document.getElementById('copyLink');

// Cores para usuários anônimos
const userColors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', 
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
    '#16a085', '#27ae60', '#2980b9', '#8e44ad'
];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    authenticateUser();
    setupEventListeners();
    checkExistingRoom();
});

// Autenticar usuário
async function authenticateUser() {
    try {
        await auth.signInAnonymously();
        console.log('Autenticado com sucesso');
    } catch (error) {
        console.error('Erro na autenticação:', error);
        showError('Erro ao conectar. Recarregue a página.');
    }
}

// Verificar se já existe sala na URL
function checkExistingRoom() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        joinRoomInput.value = hash;
        // Auto-entrar se houver sala na URL
        setTimeout(() => joinRoom(), 500);
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Criar sala
    createRoomBtn.addEventListener('click', createRoom);
    createRoomInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createRoom();
    });
    
    // Entrar na sala
    joinRoomBtn.addEventListener('click', joinRoom);
    joinRoomInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinRoom();
    });
    
    // Enviar mensagem
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Copiar link
    copyLinkBtn.addEventListener('click', copyRoomLink);
    
    // Detectar mudanças na URL
    window.addEventListener('hashchange', () => {
        location.reload();
    });
}

// Validar nome da sala
function validateRoomName(name) {
    const cleaned = name.trim().toLowerCase();
    
    if (cleaned.length < 3) {
        showError('Nome da sala deve ter pelo menos 3 caracteres');
        return null;
    }
    
    if (cleaned.length > 30) {
        showError('Nome da sala deve ter no máximo 30 caracteres');
        return null;
    }
    
    // Permitir apenas letras, números e hífens
    if (!/^[a-z0-9-]+$/.test(cleaned)) {
        showError('Use apenas letras, números e hífens no nome da sala');
        return null;
    }
    
    return cleaned;
}

// Criar nova sala
async function createRoom() {
    const roomName = validateRoomName(createRoomInput.value);
    if (!roomName) return;
    
    createRoomBtn.disabled = true;
    createRoomBtn.textContent = 'Criando...';
    
    try {
        // Verificar se sala já existe
        const snapshot = await database.ref(`rooms/${roomName}/metadata`).once('value');
        
        if (snapshot.exists()) {
            showError('Esta sala já existe! Use "Entrar em uma sala" para acessá-la.');
            createRoomBtn.disabled = false;
            createRoomBtn.textContent = 'Criar Sala';
            return;
        }
        
        // Criar metadados da sala
        await database.ref(`rooms/${roomName}/metadata`).set({
            name: roomName,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Redirecionar para a sala
        window.location.hash = roomName;
        enterChat(roomName);
        
    } catch (error) {
        console.error('Erro ao criar sala:', error);
        showError('Erro ao criar sala. Tente novamente.');
        createRoomBtn.disabled = false;
        createRoomBtn.textContent = 'Criar Sala';
    }
}

// Entrar em sala existente
async function joinRoom() {
    const roomName = validateRoomName(joinRoomInput.value);
    if (!roomName) return;
    
    joinRoomBtn.disabled = true;
    joinRoomBtn.textContent = 'Entrando...';
    
    try {
        // Verificar se sala existe
        const snapshot = await database.ref(`rooms/${roomName}/metadata`).once('value');
        
        if (!snapshot.exists()) {
            showError('Sala não encontrada! Verifique o nome ou crie uma nova sala.');
            joinRoomBtn.disabled = false;
            joinRoomBtn.textContent = 'Entrar';
            return;
        }
        
        // Entrar na sala
        window.location.hash = roomName;
        enterChat(roomName);
        
    } catch (error) {
        console.error('Erro ao entrar na sala:', error);
        showError('Erro ao entrar na sala. Tente novamente.');
        joinRoomBtn.disabled = false;
        joinRoomBtn.textContent = 'Entrar';
    }
}

// Entrar no chat
function enterChat(roomName) {
    currentRoom = roomName;
    currentUser = auth.currentUser.uid;
    userColor = userColors[Math.floor(Math.random() * userColors.length)];
    
    // Atualizar UI
    roomNameSpan.textContent = `Sala: ${roomName}`;
    roomScreen.style.display = 'none';
    chatArea.style.display = 'flex';
    roomInfo.style.display = 'flex';
    
    // Inicializar listeners
    initializeMessagesListener();
    initializePresence();
    
    // Focar no input
    messageInput.focus();
}

// Inicializar listener de mensagens
function initializeMessagesListener() {
    messagesRef = database.ref(`rooms/${currentRoom}/messages`);
    
    // Carregar últimas 100 mensagens
    messagesRef.orderByChild('timestamp').limitToLast(100).on('child_added', (snapshot) => {
        const message = snapshot.val();
        displayMessage(message);
    });
}

// Inicializar presença (usuários online)
function initializePresence() {
    presenceRef = database.ref(`rooms/${currentRoom}/presence/${currentUser}`);
    
    // Marcar como online
    presenceRef.set({
        online: true,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    
    // Remover ao desconectar
    presenceRef.onDisconnect().remove();
    
    // Contar usuários online
    const presenceListRef = database.ref(`rooms/${currentRoom}/presence`);
    presenceListRef.on('value', (snapshot) => {
        const count = snapshot.numChildren();
        onlineCountSpan.textContent = `👥 ${count} online`;
    });
}

// Enviar mensagem
function sendMessage() {
    const content = messageInput.value.trim();
    
    if (!content) return;
    
    if (content.length > 500) {
        showError('Mensagem muito longa! Máximo de 500 caracteres.');
        return;
    }
    
    const message = {
        content: content,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        userId: currentUser,
        color: userColor
    };
    
    // Desabilitar botão temporariamente
    sendButton.disabled = true;
    
    // Enviar para Firebase
    messagesRef.push(message)
        .then(() => {
            messageInput.value = '';
            messageInput.focus();
            sendButton.disabled = false;
        })
        .catch((error) => {
            console.error('Erro ao enviar mensagem:', error);
            showError('Erro ao enviar mensagem. Tente novamente.');
            sendButton.disabled = false;
        });
}

// Exibir mensagem
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const time = message.timestamp ? new Date(message.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    }) : '';
    
    const color = message.color || '#333';
    const isOwnMessage = message.userId === currentUser;
    const authorLabel = isOwnMessage ? 'Enviado' : 'Recebido';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-author">
                <span class="user-icon" style="background-color: ${color}"></span>
                ${escapeHtml(authorLabel)}
            </span>
            <span class="message-time">${time}</span>
        </div>
        <div class="message-content" style="border-left-color: ${color}">
            ${escapeHtml(message.content)}
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    
    // Scroll para última mensagem
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Copiar link da sala
function copyRoomLink() {
    const link = window.location.href;
    
    navigator.clipboard.writeText(link).then(() => {
        copyLinkBtn.textContent = '✅ Copiado!';
        setTimeout(() => {
            copyLinkBtn.textContent = '📋 Copiar Link';
        }, 2000);
    }).catch(() => {
        // Fallback para navegadores antigos
        const textarea = document.createElement('textarea');
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        copyLinkBtn.textContent = '✅ Copiado!';
        setTimeout(() => {
            copyLinkBtn.textContent = '📋 Copiar Link';
        }, 2000);
    });
}

// Mostrar erro
function showError(message) {
    alert(message);
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Limpar presença ao sair
window.addEventListener('beforeunload', () => {
    if (presenceRef) {
        presenceRef.remove();
    }
});