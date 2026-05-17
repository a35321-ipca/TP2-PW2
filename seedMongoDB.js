const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Importar modelos
const Perfil = require('./models/Perfil');
const User = require('./models/User');
const Curso = require('./models/Curso');
const UnidadeCurricular = require('./models/UnidadeCurricular');
const PlanoEstudos = require('./models/PlanoEstudos');
const FichaAluno = require('./models/FichaAluno');
const Pauta = require('./models/Pauta');
const PautaAluno = require('./models/PautaAluno');
const PedidoMatricula = require('./models/PedidoMatricula');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/escola';

async function seedDB() {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB conectado!');

    console.log('🗑️  Limpando base de dados...');
    await Promise.all([
      Perfil.deleteMany({}),
      User.deleteMany({}),
      Curso.deleteMany({}),
      UnidadeCurricular.deleteMany({}),
      PlanoEstudos.deleteMany({}),
      FichaAluno.deleteMany({}),
      Pauta.deleteMany({}),
      PautaAluno.deleteMany({}),
      PedidoMatricula.deleteMany({})
    ]);

    console.log('📝 Criando perfis...');
    const perfis = await Perfil.insertMany([
      { nome: 'Aluno' },
      { nome: 'Funcionario' },
      { nome: 'Gestor' }
    ]);
    console.log(`✅ ${perfis.length} perfis criados`);

    console.log('👥 Criando utilizadores...');
    const usuarios = [];
    usuarios.push(await User.create({
      username: 'admin',
      email: 'admin@escola.pt',
      password: '123456',
      perfil: perfis.find(p => p.nome === 'Gestor')._id
    }));
    usuarios.push(await User.create({
      username: 'funcionario',
      email: 'servicos.academicos@escola.pt',
      password: '123456',
      perfil: perfis.find(p => p.nome === 'Funcionario')._id
    }));
    console.log(`✅ ${usuarios.length} utilizadores criados`);

    console.log('🎓 Criando cursos...');
    const cursos = await Curso.insertMany([
      { nome: 'Licenciatura em Informática', sigla: 'LI', ativo: true },
      { nome: 'Licenciatura em Matemática', sigla: 'LM', ativo: true },
      { nome: 'Mestrado em Inteligência Artificial', sigla: 'MIA', ativo: true }
    ]);
    console.log(`✅ ${cursos.length} cursos criados`);

    console.log('📚 Criando unidades curriculares...');
    const ucs = await UnidadeCurricular.insertMany([
      { nome: 'Programação I', curso: cursos[0]._id, ects: 6 },
      { nome: 'Programação II', curso: cursos[0]._id, ects: 6 },
      { nome: 'Bases de Dados', curso: cursos[0]._id, ects: 6 },
      { nome: 'Algoritmos', curso: cursos[0]._id, ects: 6 },
      { nome: 'Web Development', curso: cursos[0]._id, ects: 6 },
      { nome: 'Análise Matemática I', curso: cursos[1]._id, ects: 6 },
      { nome: 'Análise Matemática II', curso: cursos[1]._id, ects: 6 },
      { nome: 'Álgebra Linear', curso: cursos[1]._id, ects: 6 },
      { nome: 'Machine Learning', curso: cursos[2]._id, ects: 9 },
      { nome: 'Deep Learning', curso: cursos[2]._id, ects: 9 }
    ]);
    console.log(`✅ ${ucs.length} unidades curriculares criadas`);

    console.log('📅 Criando plano de estudos...');
    const planoEstudos = await PlanoEstudos.insertMany([
      // 1º ano, 1º semestre - LI
      { curso: cursos[0]._id, uc: ucs[0]._id, ano: 1, semestre: 1 },
      { curso: cursos[0]._id, uc: ucs[3]._id, ano: 1, semestre: 1 },
      // 1º ano, 2º semestre - LI
      { curso: cursos[0]._id, uc: ucs[1]._id, ano: 1, semestre: 2 },
      { curso: cursos[0]._id, uc: ucs[2]._id, ano: 1, semestre: 2 },
      // 2º ano, 1º semestre - LI
      { curso: cursos[0]._id, uc: ucs[4]._id, ano: 2, semestre: 1 },
      // 1º ano, 1º semestre - LM
      { curso: cursos[1]._id, uc: ucs[5]._id, ano: 1, semestre: 1 },
      { curso: cursos[1]._id, uc: ucs[7]._id, ano: 1, semestre: 1 },
      // 1º ano, 2º semestre - LM
      { curso: cursos[1]._id, uc: ucs[6]._id, ano: 1, semestre: 2 },
      // 1º ano, 1º semestre - MIA
      { curso: cursos[2]._id, uc: ucs[8]._id, ano: 1, semestre: 1 },
      // 1º ano, 2º semestre - MIA
      { curso: cursos[2]._id, uc: ucs[9]._id, ano: 1, semestre: 2 }
    ]);
    console.log(`✅ ${planoEstudos.length} planos de estudo criados`);

    console.log('📊 Criando pautas...');
    const pautas = await Pauta.insertMany([
      {
        uc: ucs[0]._id,
        curso: cursos[0]._id,
        ano_letivo: '2025/2026',
        epoca: 'Normal',
        funcionario: usuarios.find(u => u.username === 'funcionario')._id
      },
      {
        uc: ucs[1]._id,
        curso: cursos[0]._id,
        ano_letivo: '2025/2026',
        epoca: 'Normal',
        funcionario: usuarios.find(u => u.username === 'funcionario')._id
      }
    ]);
    console.log(`✅ ${pautas.length} pautas criadas`);

    console.log('✨ Seed concluído com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro durante seed:', err);
    process.exit(1);
  }
}

seedDB();
