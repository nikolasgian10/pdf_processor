require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./src/config/database');
const unitRoutes = require('./src/routes/units'); // Reativado
const pdfRoutes = require('./src/routes/pdfRoutes'); // Reativado
const occurrenceRoutes = require('./src/routes/occurrenceRoutes'); // Reativado
const reportRoutes = require('./src/routes/reportRoutes'); // Reativado
const controlRoutes = require('./src/routes/control'); // Reativado
const statsRoutes = require('./src/routes/stats'); // Reativado
const multer = require('multer');
const pdfController = require('./src/controllers/pdfController');

const app = express();

// Configuração do Multer para upload de arquivos
const uploadDir = path.join(__dirname, 'uploads'); // Manter apenas para referência, se necessário

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos PDF são permitidos'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite de 10MB
    }
});

// Middleware (Multer para upload deve vir antes de express.json() e express.urlencoded())
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));

// Rota de upload de PDF com Multer aplicado diretamente aqui (antes dos parsers gerais)
app.post('/api/pdfs/process-pdf', upload.single('file'), pdfController.uploadPDF);

// As rotas que não envolvem upload de arquivos podem usar express.json() e express.urlencoded() normalmente
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com o banco de dados
connectDB();

// Outras rotas
app.use('/api/pdfs', pdfRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/occurrences', occurrenceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/control', controlRoutes);
app.use('/api/stats', statsRoutes);

// Rota básica (mantida)
app.get('/', (req, res) => {
    res.json({ message: 'API de Processamento de PDF funcionando!' });
});

// Removendo tratamento de erros temporariamente
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({
//         error: 'Erro interno do servidor',
//         message: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
// });

// Porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
// Fim da simplificação 