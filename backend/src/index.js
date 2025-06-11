require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const unitsRouter = require('./routes/units');
const controlRouter = require('./routes/control');
const statsRouter = require('./routes/stats');
const pdfController = require('./controllers/pdfController');

const app = express();

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors({
  origin: 'https://pdf-processor-livid.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// console.log('CORS_ORIGIN_CONFIGURED:', process.env.FRONTEND_URL); // Removido para depuração
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pdf-processor', {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão com MongoDB:'));
db.once('open', () => {
  console.log('Conectado ao MongoDB');
});

// Rotas
app.use('/api/units', unitsRouter);
app.use('/api/control', controlRouter);
app.use('/api/stats', statsRouter);

// Upload de PDF - AGORA APONTA PARA O CONTROLADOR CORRETO E ROTA CORRETA
app.post('/api/pdfs/process-pdf', pdfController.uploadPDF);

// Nova rota para verificar se o backend está rodando
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Backend is running!' });
});

// Tratamento de erros (AGORA NO FINAL)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('PORT environment variable:', process.env.PORT);
}); 