/**
 * seed.js — Popula a base de dados com dados iniciais
 * Uso: node seed.js
 */
require('dotenv').config();

const mongoose = require('mongoose');
const User     = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/escola';

async function seed() {
  try {
    console.log('Conectando a:', MONGO_URI.substring(0, 80));
    await mongoose.connect(MONGO_URI);
    console.log('Ligado ao MongoDB...');

    // Limpar utilizadores existentes com estes usernames
    await User.deleteMany({ username: { $in: ['admin', 'funcionario'] } });

    // Criar gestor (admin)
    const adminUser = await User.create({
      username: 'admin',
      email:    'admin@escola.pt',
      password: 'admin123',   // será hasheado automaticamente pelo pre-save hook
      perfil:   'Gestor'
    });
    console.log('Admin criado:', adminUser.username);

    // Criar funcionário
    const funcUser = await User.create({
      username: 'funcionario',
      email:    'servicos.academicos@escola.pt',
      password: 'func123',
      perfil:   'Funcionario'
    });
    console.log('Funcionário criado:', funcUser.username);

    console.log('✅  Utilizadores criados:');
    console.log('   admin       / admin123  (Gestor)');
    console.log('   funcionario / func123   (Funcionario)');
    console.log('   Alunos registam-se em /registo');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

seed();
