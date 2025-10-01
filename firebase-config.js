// Configuração do Firebase
// IMPORTANTE: Use variáveis de ambiente em produção (GitHub Secrets)
// Este arquivo é um template. As variáveis serão substituídas pelo GitHub Actions.

const firebaseConfig = {
  apiKey: "${FIREBASE_API_KEY}",
  authDomain: "${FIREBASE_AUTH_DOMAIN}",
  databaseURL: "${FIREBASE_DATABASE_URL}",
  projectId: "${FIREBASE_PROJECT_ID}",
  storageBucket: "${FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${FIREBASE_APP_ID}"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências globais
const auth = firebase.auth();
const database = firebase.database();