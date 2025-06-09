const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./src/config/database');
const pdfRoutes = require('./src/routes/pdfRoutes');
const unitRoutes = require('./src/routes/units');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Configuração do CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://pdf-processor.vercel.app', 'https://pdf-processor.netlify.app'] // URLs de produção
    : '*', // Permite todas as origens em desenvolvimento
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Criar diretório de uploads se não existir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Conexão com o banco de dados
connectDB();

// Rotas
app.use('/api/pdfs', pdfRoutes);
app.use('/api/units', unitRoutes);
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

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 