const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  nome:  { type: String, required: true },
  sigla: { type: String, required: true, unique: true, uppercase: true },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Curso', cursoSchema);
