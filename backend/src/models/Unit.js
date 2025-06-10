const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Você pode adicionar outros campos aqui conforme a necessidade da sua unidade
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Unit', unitSchema); 