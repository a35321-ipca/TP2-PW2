const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Perfil  = require('../models/Perfil');

// GET /login
router.get('/login', (req, res) => {
  res.render('login', { erro: null, titulo: 'Acesso ao Sistema' });
});

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log('🔍 Login tentativa:', { username: username?.trim(), passwordLength: password?.length });
    
    const user = await User.findOne({ username: username?.trim() }).populate('perfil');
    console.log('👤 User encontrado:', user ? user.username : 'Não encontrado');
    
    if (!user) {
      console.log('❌ Utilizador não existe:', username);
      return res.render('login', { erro: 'Credenciais inválidas.', titulo: 'Acesso ao Sistema' });
    }
    
    const passwordValida = await user.verificarPassword(password);
    console.log('🔐 Password válida?', passwordValida);
    
    if (!passwordValida) {
      console.log('❌ Password inválida para:', username);
      return res.render('login', { erro: 'Credenciais inválidas.', titulo: 'Acesso ao Sistema' });
    }
    
    req.session.userId   = user._id;
    req.session.username = user.username;
    req.session.perfil   = user.perfil.nome; // Guarda nome do perfil (string)

    console.log('✅ Login bem-sucedido para:', user.username, '- Perfil:', user.perfil.nome);
    
    const destinos = { Aluno: '/aluno', Funcionario: '/funcionario', Gestor: '/gestor' };
    res.redirect(destinos[user.perfil.nome] || '/login');
  } catch (err) {
    console.error('⚠️ Erro no login:', err);
    res.render('login', { erro: 'Erro interno.', titulo: 'Acesso ao Sistema' });
  }
});

// GET /registo
router.get('/registo', (req, res) => {
  res.render('registo', { erro: null, mensagem: null, titulo: 'Criar Conta' });
});

// POST /registo
router.post('/registo', async (req, res) => {
  const { username, email, password, confirm_password } = req.body;
  console.log('📝 Registo tentativa:', { username, email });
  
  if (password !== confirm_password) {
    console.log('❌ Passwords não coincidem');
    return res.render('registo', { erro: 'As palavras-passe não coincidem.', mensagem: null, titulo: 'Criar Conta' });
  }
  try {
    const existe = await User.findOne({ $or: [{ username }, { email }] });
    if (existe) {
      console.log('❌ Utilizador ou email já existe');
      return res.render('registo', { erro: 'Username ou email já em uso.', mensagem: null, titulo: 'Criar Conta' });
    }
    
    // Buscar ObjectId do perfil 'Aluno'
    const perfilAluno = await Perfil.findOne({ nome: 'Aluno' });
    console.log('🔍 Perfil Aluno:', perfilAluno ? 'encontrado' : 'NÃO encontrado');
    
    if (!perfilAluno) {
      console.log('❌ Perfil Aluno não encontrado');
      return res.render('registo', { erro: 'Erro ao registar: Perfil Aluno não encontrado.', mensagem: null, titulo: 'Criar Conta' });
    }
    
    console.log('✍️  Criando novo utilizador...');
    const novoUser = await User.create({ username, email, password, perfil: perfilAluno._id });
    console.log('✅ Utilizador criado:', novoUser._id);
    
    res.render('registo', { erro: null, mensagem: 'Registo efetuado! Já pode fazer login.', titulo: 'Criar Conta' });
  } catch (err) {
    console.error('❌ Erro no registo:', err.message);
    res.render('registo', { erro: 'Erro ao registar: ' + err.message, mensagem: null, titulo: 'Criar Conta' });
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
