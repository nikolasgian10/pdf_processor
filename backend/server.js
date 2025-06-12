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

// Configuração do Multer para upload de arquivos (movida aqui)
const uploadDir = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
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

// Criar diretório de upload se não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware (Multer deve vir antes de express.json() e express.urlencoded() para rotas de upload)
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
// As rotas que não envolvem upload de arquivos podem usar express.json() e express.urlencoded() normalmente
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com o banco de dados
connectDB();

// Rotas
// Rota de upload de PDF com Multer aplicado diretamente aqui
app.post('/api/pdfs/process-pdf', upload.single('file'), pdfController.uploadPDF);

// Outras rotas de PDF (não de upload)
app.use('/api/pdfs', pdfRoutes);

app.use('/api/units', unitRoutes); // Reativado
app.use('/api/occurrences', occurrenceRoutes); // Reativado
app.use('/api/reports', reportRoutes); // Reativado
app.use('/api/control', controlRoutes); // Reativado
app.use('/api/stats', statsRoutes); // Reativado

// Removendo servir arquivos estáticos temporariamente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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