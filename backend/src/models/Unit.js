const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  installationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  addressSAAE: {
    type: String,
    required: true,
    trim: true
  },
  addressEDP: {
    type: String,
    required: true,
    trim: true
  },
  station: {
    type: String,
    trim: true
  },
  meter: {
    type: String,
    trim: true
  },
  class: {
    type: String,
    trim: true
  },
  mapLink: {
    type: String,
    trim: true
  },
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