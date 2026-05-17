const express        = require('express');
const router         = express.Router();
const { isAuth, isPerfil } = require('../middleware/auth');
const Curso          = require('../models/Curso');
const UnidadeCurricular = require('../models/UnidadeCurricular');
const FichaAluno     = require('../models/FichaAluno');
const Pauta          = require('../models/Pauta');
const PedidoMatricula = require('../models/PedidoMatricula');

const gestorAuth = [isAuth, isPerfil('Gestor')];

// ========================
//  DASHBOARD GESTOR
// ========================
router.get('/', gestorAuth, async (req, res) => {
  const fichas_pendentes     = await FichaAluno.find({ estado: 'Submetida' }).populate('utilizador', 'username').populate('curso');
  const matriculas_pendentes = await PedidoMatricula.find({ estado: 'Pendente' })
    .populate('aluno', 'username')
    .populate({ path: 'pauta', populate: [{ path: 'uc' }, { path: 'curso' }] });
  const cursos  = await Curso.find().sort({ nome: 1 });
  const ucs     = await UnidadeCurricular.find().populate('curso', 'sigla');

  res.render('gestor/dashboard', {
    titulo: 'Painel de Gestão',
    fichas_pendentes,
    matriculas_pendentes,
    cursos,
    ucs,
    mensagem: req.query.msg || null
  });
});

// ========================
//  ADICIONAR CURSO
// ========================
router.post('/add-curso', gestorAuth, async (req, res) => {
  const { nome_curso, sigla_curso } = req.body;
  try {
    await Curso.create({ nome: nome_curso, sigla: sigla_curso.toUpperCase() });
    res.redirect('/gestor?msg=Curso+adicionado+com+sucesso');
  } catch (err) {
    res.redirect('/gestor?msg=Erro:+' + encodeURIComponent(err.message));
  }
});

// ========================
//  ADICIONAR UC
// ========================
router.post('/add-uc', gestorAuth, async (req, res) => {
  const { nome_uc, curso_id } = req.body;
  try {
    await UnidadeCurricular.create({ nome: nome_uc, curso: curso_id });
    res.redirect('/gestor?msg=UC+adicionada+com+sucesso');
  } catch (err) {
    res.redirect('/gestor?msg=Erro:+' + encodeURIComponent(err.message));
  }
});

// ========================
//  VALIDAR FICHA
// ========================
router.post('/validar-ficha', gestorAuth, async (req, res) => {
  const { ficha_id, decisao, observacao } = req.body;
  try {
    await FichaAluno.findByIdAndUpdate(ficha_id, {
      estado: decisao,
      observacoes: observacao || '',
      validador: req.session.userId,
      data_decisao: new Date()
    });
    res.redirect('/gestor?msg=Ficha+atualizada');
  } catch (err) {
    res.redirect('/gestor?msg=Erro:+' + encodeURIComponent(err.message));
  }
});

// ========================
//  VALIDAR MATRÍCULA
// ========================
router.post('/validar-matricula', gestorAuth, async (req, res) => {
  const { matricula_id, decisao } = req.body;
  try {
    const pedido = await PedidoMatricula.findByIdAndUpdate(
      matricula_id,
      { estado: decisao, data_decisao: new Date(), funcionario: req.session.userId },
      { new: true }
    );

    // Se aprovado, inserir aluno na pauta (evitar duplicados)
    if (decisao === 'Aprovado' && pedido.pauta) {
      const pauta = await Pauta.findById(pedido.pauta);
      if (pauta) {
        const jaExiste = pauta.alunos.some(a => a.aluno.toString() === pedido.aluno.toString());
        if (!jaExiste) {
          pauta.alunos.push({ aluno: pedido.aluno, nota: null, resultado: null });
          await pauta.save();
        }
      }
    }

    res.redirect('/gestor?msg=Matrícula+atualizada');
  } catch (err) {
    res.redirect('/gestor?msg=Erro:+' + encodeURIComponent(err.message));
  }
});

module.exports = router;
