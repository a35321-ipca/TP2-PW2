const mongoose = require('mongoose');

const ucSchema = new mongoose.Schema({
  nome:   { type: String, required: true },
  curso:  { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true },
  ects:   { type: Number, default: 6 }
}, { timestamps: true });

module.exports = mongoose.model('UnidadeCurricular', ucSchema);
