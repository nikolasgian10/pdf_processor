const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['agua', 'esgoto', 'outras'],
    required: true,
    default: 'agua'
  }
});

module.exports = mongoose.model('Unit', UnitSchema); 