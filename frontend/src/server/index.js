const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Importando rotas
const billsRouter = require('./routes/bills');
const unitsRouter = require('./routes/units');
const statsRouter = require('./routes/stats');
const totalsRouter = require('./routes/totals');
const edpControlRouter = require('./routes/edpControl');

const app = express();

// Configuração do MongoDB
mongoose.connect('mongodb://localhost:27017/pdf-processor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão com MongoDB:'));
db.once('open', () => {
  console.log('Conectado ao MongoDB');
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servindo arquivos estáticos
app.use(express.static(path.join(__dirname, '../../build')));

// Rotas da API
app.use('/api/bills', billsRouter);
app.use('/api/units', unitsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/totals', totalsRouter);
app.use('/api/control/edp', edpControlRouter);

// Rota para o frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 