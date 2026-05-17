const express        = require('express');
const router         = express.Router();
const multer         = require('multer');
const path           = require('path');
const { isAuth, isPerfil } = require('../middleware/auth');
const User           = require('../models/User');
const Curso          = require('../models/Curso');
const FichaAluno     = require('../models/FichaAluno');
const Pauta          = require('../models/Pauta');
const PautaAluno     = require('../models/PautaAluno');
const PedidoMatricula = require('../models/PedidoMatricula');

// --- Multer upload config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'foto_' + Date.now() + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Apenas JPG/PNG são permitidos.'));
  }
});

const alunoAuth = [isAuth, isPerfil('Aluno')];

// ========================
//  DASHBOARD DO ALUNO
// ========================
router.get('/', alunoAuth, async (req, res) => {
  const aluno_id = req.session.userId;
  const ficha = await FichaAluno.findOne({ utilizador: aluno_id }).populate('curso');

  // Buscar notas de todas as pautas onde o aluno está inscrito (via PautaAluno)
  const pautasAluno = await PautaAluno.find({ aluno: aluno_id })
    .populate({
      path: 'pauta',
      populate: [
        { path: 'uc', select: 'nome' },
        { path: 'curso', select: 'sigla' }
      ]
    });

  const minhas_notas = pautasAluno.map(pa => ({
    uc_nome:     pa.pauta.uc.nome,
    curso_sigla: pa.pauta.curso.sigla,
    ano_letivo:  pa.pauta.ano_letivo,
    epoca:       pa.pauta.epoca,
    nota:        pa.nota,
    resultado:   pa.resultado
  }));

  res.render('aluno/dashboard', {
    titulo: 'Painel do Aluno',
    username: req.session.username,
    ficha,
    minhas_notas
  });
});

// ========================
//  FICHA DE ALUNO
// ========================
router.get('/ficha', alunoAuth, async (req, res) => {
  const ficha  = await FichaAluno.findOne({ utilizador: req.session.userId });
  const cursos = await Curso.find({ ativo: true });
  res.render('aluno/ficha', {
    titulo: 'Minha Ficha de Aluno',
    ficha,
    cursos,
    mensagem: req.query.msg || null,
    erro: null
  });
});

router.post('/ficha', alunoAuth, upload.single('foto'), async (req, res) => {
  const { nome_completo, data_nascimento, morada, contacto, email, curso_id } = req.body;
  const aluno_id = req.session.userId;
  let foto_path = null;

  if (req.file) foto_path = 'uploads/' + req.file.filename;

  try {
    const ficha = await FichaAluno.findOne({ utilizador: aluno_id });
    const dados = {
      nome_completo, data_nascimento, morada, contacto, email,
      curso: curso_id, estado: 'Submetida'
    };
    if (foto_path) dados.foto_path = foto_path;

    if (ficha) {
      await FichaAluno.updateOne({ utilizador: aluno_id }, dados);
    } else {
      await FichaAluno.create({ utilizador: aluno_id, ...dados });
    }
    res.redirect('/aluno/ficha?msg=Ficha+atualizada+com+sucesso');
  } catch (err) {
    const cursos = await Curso.find({ ativo: true });
    const fichaAtual = await FichaAluno.findOne({ utilizador: aluno_id });
    res.render('aluno/ficha', { titulo: 'Minha Ficha', ficha: fichaAtual, cursos, mensagem: null, erro: err.message });
  }
});

// ========================
//  INSCRIÇÃO EM UCs
// ========================
router.get('/matricula', alunoAuth, async (req, res) => {
  const aluno_id = req.session.userId;
  const ficha = await FichaAluno.findOne({ utilizador: aluno_id, estado: 'Aprovada' });

  let pautas_disponiveis = [];
  if (ficha) {
    pautas_disponiveis = await Pauta.find({ curso: ficha.curso })
      .populate('uc')
      .sort({ ano_letivo: -1 });
  }

  res.render('aluno/matricula', {
    titulo: 'Inscrição em Disciplinas',
    ficha,
    pautas_disponiveis,
    mensagem: req.query.msg || null,
    erro: req.query.erro || null
  });
});

router.post('/matricula', alunoAuth, async (req, res) => {
  const { pauta_id } = req.body;
  const aluno_id = req.session.userId;

  try {
    // Verificar se já está na pauta
    const pautaDoc = await Pauta.findById(pauta_id);
    const jaInscrito = await PautaAluno.findOne({ pauta: pauta_id, aluno: aluno_id });
    if (jaInscrito) return res.redirect('/aluno/matricula?erro=Já+estás+inscrito+nesta+disciplina');

    // Verificar pedido pendente
    const jaPendente = await PedidoMatricula.findOne({ aluno: aluno_id, ano_letivo: new Date().getFullYear().toString(), estado: 'Pendente' });
    if (jaPendente) return res.redirect('/aluno/matricula?erro=Já+tens+um+pedido+pendente');

    const pauta = await Pauta.findById(pauta_id);
    await PedidoMatricula.create({
      aluno: aluno_id,
      ano_letivo: pauta.ano_letivo,
      estado: 'Pendente'
    });

    res.redirect('/aluno/matricula?msg=Pedido+enviado!+Aguarda+aprovação');
  } catch (err) {
    res.redirect('/aluno/matricula?erro=' + encodeURIComponent(err.message));
  }
});

module.exports = router;
