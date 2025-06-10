const mongoose = require('mongoose');

const PDFSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    processedText: {
        type: String,
        required: true
    },
    metadata: {
        pageCount: Number,
        author: String,
        creationDate: Date,
        keywords: [String]
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['processed', 'failed', 'processing'],
        default: 'processing'
    },
    unit: {
        type: String,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('PDF', PDFSchema); 