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

// Log para depuração do CORS_ORIGIN
console.log('CORS_ORIGIN do ambiente:', process.env.CORS_ORIGIN);

// --- NOVO: Middleware CORS direto para forçar cabeçalhos ---
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permitir qualquer origem
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
// --- FIM DO NOVO MIDDLEWARE ---

// Middleware para lidar com OPTIONS requests (pré-checagem de CORS) - Colocado no início
// (Mantido por segurança, mas o middleware direto deve lidar com a maioria)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*'); // Permitir qualquer origem para OPTIONS
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(200); // Responder com status 200 para pré-checagem
  }
  next();
});

// Middleware principal
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do CORS (este agora é redundante e pode ser removido depois se funcionar)
// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

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
// Pequena alteração para forçar novo deploy 