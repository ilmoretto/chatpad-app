// Configuração do Firebase
// IMPORTANTE: Use variáveis de ambiente em produção (GitHub Secrets)
// Este arquivo é um template. As variáveis serão substituídas pelo GitHub Actions.

const firebaseConfig = {
  apiKey: "AIzaSyCyLXPt2eh8nLmAG34wmEcrt-SkkWFgl3Q",
  authDomain: "chatpad-app-2712e.firebaseapp.com",
  databaseURL: "https://chatpad-app-2712e-default-rtdb.firebaseio.com",
  projectId: "chatpad-app-2712e",
  storageBucket: "chatpad-app-2712e.firebasestorage.app",
  messagingSenderId: "991519277155",
  appId: "1:991519277155:web:d91bfcfe2212d905227856"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências globais
const auth = firebase.auth();
const database = firebase.database();