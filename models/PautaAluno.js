const mongoose = require('mongoose');

const pautaAlunoSchema = new mongoose.Schema({
  pauta:      { type: mongoose.Schema.Types.ObjectId, ref: 'Pauta', required: true },
  aluno:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nota:       { type: Number, min: 0, max: 20, default: null },
  resultado:  { type: String, default: null },
  nota_final: { type: Number, min: 0, max: 20, default: null }
}, { timestamps: true });

module.exports = mongoose.model('PautaAluno', pautaAlunoSchema);
