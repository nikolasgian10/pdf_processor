const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },
  installationNumber: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  responsible: {
    type: String,
    required: true
  },
  contact: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
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