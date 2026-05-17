const mongoose = require('mongoose');

const fichaAlunoSchema = new mongoose.Schema({
  utilizador:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  curso:           { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true },
  nome_completo:   { type: String, default: null },
  morada:          { type: String, default: null },
  data_nascimento: { type: Date, default: null },
  contacto:        { type: String, default: null },
  email:           { type: String, default: null },
  foto_path:       { type: String, default: null },
  estado:          { type: String, enum: ['Rascunho','Submetida','Aprovada','Rejeitada'], default: 'Rascunho' },
  validador:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  data_decisao:    { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('FichaAluno', fichaAlunoSchema);
