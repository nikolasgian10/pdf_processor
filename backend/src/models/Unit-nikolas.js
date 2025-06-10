const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  installationNumber: {
    type: String,
    required: true,
    unique: true
  },
  addressSAAE: {
    type: String,
    required: true
  },
  addressEDP: {
    type: String,
    required: true
  },
  station: String,
  meter: String,
  class: String,
  mapLink: String,
  status: {
    type: String,
    enum: ['ativo', 'inativo'],
    default: 'ativo'
  },
  bandeira: {
    type: String,
    enum: ['verde', 'amarela', 'vermelha'],
    default: 'verde'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Unit', unitSchema); 