require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const path = require('path'); // Temporariamente removido
// const fs = require('fs'); // Temporariamente removido
const connectDB = require('./src/config/database');
const unitRoutes = require('./src/routes/units'); // Reativado
const pdfRoutes = require('./src/routes/pdfRoutes'); // Reativado
const occurrenceRoutes = require('./src/routes/occurrenceRoutes'); // Reativado
const reportRoutes = require('./src/routes/reportRoutes'); // Reativado
const controlRoutes = require('./src/routes/control'); // Reativado
const statsRoutes = require('./src/routes/stats'); // Reativado

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

// Rotas
app.use('/api/units', unitRoutes); // Reativado
app.use('/api/pdfs', pdfRoutes); // Reativado
app.use('/api/occurrences', occurrenceRoutes); // Reativado
app.use('/api/reports', reportRoutes); // Reativado
app.use('/api/control', controlRoutes); // Reativado
app.use('/api/stats', statsRoutes); // Reativado

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