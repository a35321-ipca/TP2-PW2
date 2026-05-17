const mongoose = require('mongoose');

const planoEstudosSchema = new mongoose.Schema({
  curso:   { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true },
  uc:      { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadeCurricular', required: true },
  ano:     { type: Number, required: true },
  semestre: { type: Number, required: true }
}, { timestamps: true });

// Garantir que uma UC aparece apenas uma vez por semestre/ano/curso
planoEstudosSchema.index({ curso: 1, uc: 1, ano: 1, semestre: 1 }, { unique: true });

module.exports = mongoose.model('PlanoEstudos', planoEstudosSchema);
