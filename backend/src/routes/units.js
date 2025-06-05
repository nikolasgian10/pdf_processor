const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const MonthlyData = require('../models/MonthlyData');

// Listar unidades
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { tipo: type } : {};
    const units = await Unit.find(query);
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Buscar dados mensais de uma unidade
router.get('/:id/monthly-data', async (req, res) => {
  try {
    const monthlyData = await MonthlyData.find({ unit: req.params.id })
      .sort({ ano: 1, mes: 1 });
    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criar unidade
router.post('/', async (req, res) => {
  const unit = new Unit({
    nome: req.body.nome,
    numeroInstalacao: req.body.numeroInstalacao,
    tipo: req.body.tipo,
    endereco: req.body.endereco,
    responsavel: req.body.responsavel
  });

  try {
    const newUnit = await unit.save();
    res.status(201).json(newUnit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Atualizar unidade
router.patch('/:id', async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unidade não encontrada' });
    }

    if (req.body.nome) unit.nome = req.body.nome;
    if (req.body.numeroInstalacao) unit.numeroInstalacao = req.body.numeroInstalacao;
    if (req.body.tipo) unit.tipo = req.body.tipo;
    if (req.body.endereco) unit.endereco = req.body.endereco;
    if (req.body.responsavel) unit.responsavel = req.body.responsavel;

    const updatedUnit = await unit.save();
    res.json(updatedUnit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deletar unidade
router.delete('/:id', async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unidade não encontrada' });
    }

    await MonthlyData.deleteMany({ unit: req.params.id });
    await unit.remove();
    res.json({ message: 'Unidade removida' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 