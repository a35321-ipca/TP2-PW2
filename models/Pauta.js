const mongoose = require('mongoose');

const alunoNotaSchema = new mongoose.Schema({
  aluno:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nota:      { type: Number, min: 0, max: 20, default: null },
  resultado: { type: String, enum: ['Aprovado', 'Reprovado', null], default: null }
});

const pautaSchema = new mongoose.Schema({
  uc:          { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadeCurricular', required: true },
  curso:       { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true },
  ano_letivo:  { type: String, required: true },
  epoca:       { type: String, enum: ['Normal', 'Recurso', 'Especial'], required: true },
  funcionario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  alunos:      [alunoNotaSchema]
}, { timestamps: true });

module.exports = mongoose.model('Pauta', pautaSchema);
