const mongoose = require('mongoose');

const pedidoMatriculaSchema = new mongoose.Schema({
  aluno:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ano_letivo:  { type: String, required: true },
  estado:      { type: String, enum: ['Pendente', 'Aprovado', 'Rejeitado'], default: 'Pendente' },
  funcionario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  data_decisao: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('PedidoMatricula', pedidoMatriculaSchema);
