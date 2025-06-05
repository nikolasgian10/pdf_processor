const mongoose = require('mongoose');

const controlSchema = new mongoose.Schema({
  mes: {
    type: String,
    required: true,
    unique: true
  },
  vencimento: Date,
  modoPagamento: {
    type: String,
    enum: ['boleto', 'transferencia', 'debito']
  },
  numeroFatura: String,
  valorEstimado: Number,
  valorPago: Number,
  status: {
    type: String,
    enum: ['pendente', 'confirmado'],
    default: 'pendente'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const empenhoSchema = new mongoose.Schema({
  valor: {
    type: Number,
    required: true
  },
  ano: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = {
  Control: mongoose.model('Control', controlSchema),
  Empenho: mongoose.model('Empenho', empenhoSchema)
}; 