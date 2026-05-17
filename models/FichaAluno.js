const mongoose = require('mongoose');

const fichaAlunoSchema = new mongoose.Schema({
  utilizador:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  curso:           { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true },
  nome_completo:   { type: String },
  morada:          { type: String },
  data_nascimento: { type: Date },
  contacto:        { type: String },
  email:           { type: String },
  foto_path:       { type: String },
  estado:          { type: String, enum: ['Rascunho','Submetida','Aprovada','Rejeitada'], default: 'Rascunho' },
  observacoes:     { type: String },
  validador:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  data_decisao:    { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('FichaAluno', fichaAlunoSchema);
