require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Perfil = require('./models/Perfil');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/escola';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    console.log('📊 Estatísticas do MongoDB:');
    const totalUsers = await User.countDocuments();
    const totalPerfis = await Perfil.countDocuments();
    
    console.log(`Total de utilizadores: ${totalUsers}`);
    console.log(`Total de perfis: ${totalPerfis}`);
    
    // Listar todos os users
    const users = await User.find().populate('perfil', 'nome');
    console.log('\n👥 Utilizadores na BD:');
    users.forEach(u => {
      console.log(`  - ${u.username} (${u.perfil?.nome || 'SEM PERFIL'}) - Email: ${u.email}`);
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Erro:', err.message);
  }
})();
