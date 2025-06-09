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
  station: {
    type: String
  },
  meter: {
    type: String
  },
  class: {
    type: String
  },
  mapLink: {
    type: String
  },
  bandeira: {
    type: String,
    enum: ['verde', 'amarela', 'vermelha'],
    required: true
  },
  status: {
    type: String,
    enum: ['ativo', 'inativo'],
    default: 'ativo',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

unitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Unit', unitSchema); 