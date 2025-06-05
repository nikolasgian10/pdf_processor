const mongoose = require('mongoose');

const monthlyDataSchema = new mongoose.Schema({
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  dataLeitura: {
    type: Date,
    required: true
  },
  vencimento: {
    type: Date,
    required: true
  },
  potenciaAtiva: {
    type: Number,
    required: true
  },
  valor: {
    type: Number,
    required: true
  },
  mes: {
    type: String,
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

module.exports = mongoose.model('MonthlyData', monthlyDataSchema); 