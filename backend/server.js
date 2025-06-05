const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/database');
const pdfRoutes = require('./src/routes/pdfRoutes');
require('dotenv').config();

const app = express();

// Configuração do CORS para desenvolvimento
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://pdf-processor.vercel.app', 'https://pdf-processor.netlify.app'] // URLs de produção
    : '*', // Permite todas as origens em desenvolvimento
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar ao banco de dados
connectDB();

// Rotas
app.use('/api/pdfs', pdfRoutes);
app.use('/api/units', require('./src/routes/unitRoutes'));
app.use('/api/occurrences', require('./src/routes/occurrenceRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/control', require('./src/routes/control'));
app.use('/api/stats', require('./src/routes/stats'));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota básica
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Processamento de PDF funcionando!',
        environment: process.env.NODE_ENV || 'development'
    });
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} em modo ${NODE_ENV}`);
}); 