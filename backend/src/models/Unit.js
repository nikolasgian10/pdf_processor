const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  numeroInstalacao: {
    type: String,
    required: true,
    unique: true
  },
  tipo: {
    type: String,
    enum: ['agua', 'esgoto', 'outras'],
    required: true
  },
  endereco: String,
  responsavel: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Unit', unitSchema); 