const express = require('express');
const router  = express.Router();
const User    = require('../models/User');

// GET /login
router.get('/login', (req, res) => {
  res.render('login', { erro: null, titulo: 'Acesso ao Sistema' });
});

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    console.log('User encontrado:', user ? user.username : 'Não encontrado');
    
    if (!user) {
      console.log('Utilizador não existe:', username);
      return res.render('login', { erro: 'Credenciais inválidas.', titulo: 'Acesso ao Sistema' });
    }
    
    const passwordValida = await user.verificarPassword(password);
    console.log('Password válida:', passwordValida);
    
    if (!passwordValida) {
      console.log('Password inválida para:', username);
      return res.render('login', { erro: 'Credenciais inválidas.', titulo: 'Acesso ao Sistema' });
    }
    
    req.session.userId   = user._id;
    req.session.username = user.username;
    req.session.perfil   = user.perfil;

    const destinos = { Aluno: '/aluno', Funcionario: '/funcionario', Gestor: '/gestor' };
    res.redirect(destinos[user.perfil] || '/login');
  } catch (err) {
    console.error('Erro no login:', err);
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
  if (password !== confirm_password) {
    return res.render('registo', { erro: 'As palavras-passe não coincidem.', mensagem: null, titulo: 'Criar Conta' });
  }
  try {
    const existe = await User.findOne({ $or: [{ username }, { email }] });
    if (existe) {
      return res.render('registo', { erro: 'Username ou email já em uso.', mensagem: null, titulo: 'Criar Conta' });
    }
    await User.create({ username, email, password, perfil: 'Aluno' });
    res.render('registo', { erro: null, mensagem: 'Registo efetuado! Já pode fazer login.', titulo: 'Criar Conta' });
  } catch (err) {
    res.render('registo', { erro: 'Erro ao registar: ' + err.message, mensagem: null, titulo: 'Criar Conta' });
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
