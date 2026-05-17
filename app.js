require('dotenv').config();

console.log('🚀 App iniciado!');

const express  = require('express');
const mongoose = require('mongoose');
const session  = require('express-session');
const path     = require('path');

const authRoutes       = require('./routes/auth');
const alunoRoutes      = require('./routes/aluno');
const funcionarioRoutes = require('./routes/funcionario');
const gestorRoutes     = require('./routes/gestor');

const app = express();

// ========================
//  BASE DE DADOS (MongoDB)
// ========================
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/escola';

const mongooseOptions = {
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 60000,
  maxPoolSize: 20,
  minPoolSize: 5,
  retryWrites: true,
  w: 'majority',
  family: 4,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 60000
};

mongoose.connect(MONGO_URI, mongooseOptions)
  .then(() => console.log('✅  MongoDB ligado com sucesso!'))
  .catch(err => { 
    console.error('⚠️  Aviso MongoDB:', err.message);
    console.log('💡 Tentando reconectar em 5 segundos...');
  });

// Handle reconnection
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB desligado. Tentando reconectar...');
});

mongoose.connection.on('connected', () => {
  console.log('✅  MongoDB reconectado com sucesso!');
});

// ========================
//  CONFIGURAÇÕES
// ========================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para logar requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'escola_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 horas
}));

// ========================
//  ROTAS
// ========================
app.use('/',            authRoutes);
app.use('/aluno',       alunoRoutes);
app.use('/funcionario', funcionarioRoutes);
app.use('/gestor',      gestorRoutes);

// Redirecionar raiz para login
app.get('/', (req, res) => res.redirect('/login'));

// 404
app.use((req, res) => {
  res.status(404).send('<h2>404 — Página não encontrada</h2><a href="/login">Voltar ao login</a>');
});

// ========================
//  INICIAR SERVIDOR
// ========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀  Servidor a correr em http://localhost:${PORT}`);
});
