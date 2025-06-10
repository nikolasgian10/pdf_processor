const express = require('express');
const mongoose = require('mongoose');
// const cors = require('cors'); // Temporariamente removido
// const path = require('path'); // Temporariamente removido
// const fs = require('fs'); // Temporariamente removido
const connectDB = require('./src/config/database');
// const pdfRoutes = require('./src/routes/pdfRoutes'); // Temporariamente removido
// const unitRoutes = require('./src/routes/units'); // Temporariamente removido
// const occurrenceRoutes = require('./src/routes/occurrenceRoutes'); // Temporariamente removido
// const reportRoutes = require('./src/routes/reportRoutes'); // Temporariamente removido
// const controlRoutes = require('./src/routes/control'); // Temporariamente removido
// const statsRoutes = require('./src/routes/stats'); // Temporariamente removido
require('dotenv').config();

const app = express();

// Log para depuração do CORS_ORIGIN (mantido para visualização nos logs, mas não afetará o CORS agora)
console.log('CORS_ORIGIN do ambiente:', process.env.CORS_ORIGIN);

// Removendo todos os middlewares e configurações de CORS temporariamente
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });

// app.use((req, res, next) => {
//   if (req.method === 'OPTIONS') {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     return res.sendStatus(200);
//   }
//   next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Removendo criação de diretório de uploads temporariamente
// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// Conexão com o banco de dados
connectDB();

// Removendo todas as rotas complexas temporariamente
// app.use('/api/pdfs', pdfRoutes);
// app.use('/api/units', unitRoutes);
// app.use('/api/occurrences', require('./src/routes/occurrenceRoutes'));
// app.use('/api/reports', require('./src/routes/reportRoutes'));
// app.use('/api/control', require('./src/routes/control'));
// app.use('/api/stats', require('./src/routes/stats'));

// Removendo servir arquivos estáticos temporariamente
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota básica (mantida)
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Processamento de PDF funcionando (simplificada)! ',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Removendo tratamento de erros temporariamente
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({
//         error: 'Erro interno do servidor',
//         message: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
// Fim da simplificação 