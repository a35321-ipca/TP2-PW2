const express        = require('express');
const router         = express.Router();
const { isAuth, isPerfil } = require('../middleware/auth');
const Curso          = require('../models/Curso');
const UnidadeCurricular = require('../models/UnidadeCurricular');
const Pauta          = require('../models/Pauta');
const FichaAluno     = require('../models/FichaAluno');
const PedidoMatricula = require('../models/PedidoMatricula');

const funcAuth = [isAuth, isPerfil('Funcionario')];

// ========================
//  DASHBOARD FUNCIONÁRIO
// ========================
router.get('/', funcAuth, async (req, res) => {
  const cursos = await Curso.find({ ativo: true });
  const ucs    = await UnidadeCurricular.find().populate('curso');
  const pautas = await Pauta.find()
    .populate('uc')
    .populate('curso')
    .sort({ createdAt: -1 });

  const pauta_selecionada_id = req.query.editar_pauta || null;
  let pauta_selecionada = null;
  if (pauta_selecionada_id) {
    pauta_selecionada = await Pauta.findById(pauta_selecionada_id)
      .populate('uc')
      .populate('alunos.aluno', 'username');
  }

  res.render('funcionario/dashboard', {
    titulo: 'Serviços Académicos',
    cursos, ucs, pautas,
    pauta_selecionada,
    mensagem: req.query.msg || null
  });
});

// ========================
//  CRIAR PAUTA
// ========================
router.post('/criar-pauta', funcAuth, async (req, res) => {
  const { curso_id, uc_id, ano_letivo, epoca } = req.body;
  try {
    // Criar a pauta
    const pauta = await Pauta.create({
      uc: uc_id,
      curso: curso_id,
      ano_letivo,
      epoca,
      funcionario: req.session.userId,
      alunos: []
    });

    // Adicionar automaticamente alunos com matrícula aprovada nesse curso/ano
    const fichasAprovadas = await FichaAluno.find({ curso: curso_id, estado: 'Aprovada' });
    const alunoIds = fichasAprovadas.map(f => f.utilizador);

    const pedidosAprovados = await PedidoMatricula.find({
      aluno: { $in: alunoIds },
      ano_letivo,
      estado: 'Aprovado'
    });

    const alunosUnicos = [...new Set(pedidosAprovados.map(p => p.aluno.toString()))];
    pauta.alunos = alunosUnicos.map(id => ({ aluno: id, nota: null, resultado: null }));
    await pauta.save();

    res.redirect('/funcionario?msg=Pauta+criada+com+sucesso');
  } catch (err) {
    res.redirect('/funcionario?msg=Erro:+' + encodeURIComponent(err.message));
  }
});

// ========================
//  GRAVAR NOTAS
// ========================
router.post('/gravar-notas', funcAuth, async (req, res) => {
  const { pauta_id, notas } = req.body;
  try {
    const pauta = await Pauta.findById(pauta_id);
    for (const aluno_id in notas) {
      const valor = notas[aluno_id] === '' ? null : parseFloat(notas[aluno_id]);
      const entrada = pauta.alunos.find(a => a.aluno.toString() === aluno_id);
      if (entrada) {
        entrada.nota = valor;
        entrada.resultado = valor !== null ? (valor >= 10 ? 'Aprovado' : 'Reprovado') : null;
      }
    }
    await pauta.save();
    res.redirect('/funcionario?editar_pauta=' + pauta_id + '&msg=Notas+atualizadas');
  } catch (err) {
    res.redirect('/funcionario?msg=Erro:+' + encodeURIComponent(err.message));
  }
});

module.exports = router;
