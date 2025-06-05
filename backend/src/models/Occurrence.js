const mongoose = require('mongoose');

const occurrenceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'closed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: Date,
  comments: [{
    text: String,
    author: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

occurrenceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.status === 'closed' && !this.closedAt) {
    this.closedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Occurrence', occurrenceSchema); 