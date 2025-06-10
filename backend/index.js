const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const unitsRouter = require('./routes/units');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb+srv://nikolasgian10:saOCa0sAgasvnac1@projetojacarei.kd3fxay.mongodb.net/pdf_processor?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB conectado!'))
.catch((err) => {
  console.error('❌ Erro na conexão com o MongoDB:', err);
  process.exit(1);
});

app.use(cors({
  origin: 'https://pdf-processor-livid.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

app.use('/api/units', unitsRouter);

app.get('/', (req, res) => {
  res.send('API funcionando 🎉');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
}); 