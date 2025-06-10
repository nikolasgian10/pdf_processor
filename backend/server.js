require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const path = require('path'); // Temporariamente removido
// const fs = require('fs'); // Temporariamente removido
const connectDB = require('./src/config/database');
// const pdfRoutes = require('./src/routes/pdfRoutes'); // Temporariamente removido
// const unitRoutes = require('./src/routes/units'); // Temporariamente removido
// const occurrenceRoutes = require('./src/routes/occurrenceRoutes'); // Temporariamente removido
// const reportRoutes = require('./src/routes/reportRoutes'); // Temporariamente removido
// const controlRoutes = require('./src/routes/control'); // Temporariamente removido
// const statsRoutes = require('./src/routes/stats'); // Temporariamente removido

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
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