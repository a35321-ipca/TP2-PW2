const mongoose = require('mongoose');

const perfilSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true, enum: ['Aluno', 'Funcionario', 'Gestor'] }
}, { timestamps: true });

module.exports = mongoose.model('Perfil', perfilSchema);
