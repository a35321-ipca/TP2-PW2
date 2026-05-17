const mongoose = require('mongoose');

const pedidoMatriculaSchema = new mongoose.Schema({
  aluno:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pauta:       { type: mongoose.Schema.Types.ObjectId, ref: 'Pauta', default: null },
  ano_letivo:  { type: String },
  estado:      { type: String, enum: ['Pendente', 'Aprovado', 'Rejeitado'], default: 'Pendente' },
  funcionario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  data_decisao: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PedidoMatricula', pedidoMatriculaSchema);
