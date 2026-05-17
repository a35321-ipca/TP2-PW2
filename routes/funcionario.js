const express        = require('express');
const router         = express.Router();
const { isAuth, isPerfil } = require('../middleware/auth');
const Curso          = require('../models/Curso');
const UnidadeCurricular = require('../models/UnidadeCurricular');
const Pauta          = require('../models/Pauta');
const PautaAluno     = require('../models/PautaAluno');
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
  let alunos_pauta = [];
  
  if (pauta_selecionada_id) {
    pauta_selecionada = await Pauta.findById(pauta_selecionada_id)
      .populate('uc')
      .populate('curso');
    
    // Buscar alunos desta pauta na coleção PautaAluno
    alunos_pauta = await PautaAluno.find({ pauta: pauta_selecionada_id })
      .populate('aluno', 'username');
  }

  res.render('funcionario/dashboard', {
    titulo: 'Serviços Académicos',
    cursos, ucs, pautas,
    pauta_selecionada,
    alunos_pauta,
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
      funcionario: req.session.userId
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
    
    // Criar registos em PautaAluno para cada aluno
    for (const aluno_id of alunosUnicos) {
      await PautaAluno.create({
        pauta: pauta._id,
        aluno: aluno_id,
        nota: null,
        resultado: null
      });
    }

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
    for (const aluno_id in notas) {
      const valor = notas[aluno_id] === '' ? null : parseFloat(notas[aluno_id]);
      const pautaAluno = await PautaAluno.findOne({ pauta: pauta_id, aluno: aluno_id });
      
      if (pautaAluno) {
        pautaAluno.nota = valor;
        pautaAluno.resultado = valor !== null ? (valor >= 10 ? 'Aprovado' : 'Reprovado') : null;
        await pautaAluno.save();
      }
    }
    res.redirect('/funcionario?editar_pauta=' + pauta_id + '&msg=Notas+atualizadas');
  } catch (err) {
    res.redirect('/funcionario?msg=Erro:+' + encodeURIComponent(err.message));
  }
});

module.exports = router;
