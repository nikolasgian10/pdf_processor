require('dotenv').config();
const mongoose = require('mongoose');
const Unit = require('../models/Unit');
const MonthlyData = require('../models/MonthlyData');
const { Control } = require('../models/Control');

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

async function initializeDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pdf-processor', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Conectado ao MongoDB');

    // Limpar dados existentes
    await Unit.deleteMany({});
    await MonthlyData.deleteMany({});
    await Control.deleteMany({});

    // Criar unidades exemplo
    const units = await Unit.insertMany([
      {
        nome: 'ETA Principal',
        numeroInstalacao: '123456',
        tipo: 'agua',
        endereco: 'Rua A, 123',
        responsavel: 'João Silva'
      },
      {
        nome: 'ETE Central',
        numeroInstalacao: '789012',
        tipo: 'esgoto',
        endereco: 'Rua B, 456',
        responsavel: 'Maria Santos'
      },
      {
        nome: 'Prédio Administrativo',
        numeroInstalacao: '345678',
        tipo: 'outras',
        endereco: 'Rua C, 789',
        responsavel: 'Pedro Oliveira'
      }
    ]);

    // Criar dados mensais exemplo
    const currentYear = new Date().getFullYear();
    const monthlyDataPromises = [];

    units.forEach(unit => {
      months.forEach(mes => {
        monthlyDataPromises.push(
          MonthlyData.create({
            unit: unit._id,
            dataLeitura: new Date(currentYear, months.indexOf(mes), 15),
            vencimento: new Date(currentYear, months.indexOf(mes), 28),
            potenciaAtiva: Math.floor(Math.random() * 1000) + 500,
            valor: Math.floor(Math.random() * 5000) + 1000,
            mes,
            ano: currentYear
          })
        );
      });
    });

    await Promise.all(monthlyDataPromises);

    // Criar dados de controle exemplo
    const controlPromises = months.map(mes => 
      Control.create({
        mes,
        vencimento: new Date(currentYear, months.indexOf(mes), 28),
        valorEstimado: Math.floor(Math.random() * 10000) + 5000
      })
    );

    await Promise.all(controlPromises);

    console.log('Banco de dados inicializado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

initializeDatabase(); 