const mongoose = require('mongoose');

const pautaSchema = new mongoose.Schema({
  uc:          { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadeCurricular', required: true },
  curso:       { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', default: null },
  ano_letivo:  { type: String, required: true },
  epoca:       { type: String, enum: ['Normal', 'Recurso', 'Especial'], required: true },
  funcionario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Pauta', pautaSchema);
