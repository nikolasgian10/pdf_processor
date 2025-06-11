const express = require('express');
const router = express.Router();
const Unit = require('../src/models/Unit');
const MonthlyData = require('../models/MonthlyData');

// Listar unidades
router.get('/', async (req, res) => {
  try {
    const units = await Unit.find().lean();
    res.json(units);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
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
  console.log('Dados recebidos para criar unidade:', req.body);
  try {
    // Certifica-se de que o campo 'name' não está presente no req.body, se ele for enviado por engano.
    if (req.body.name !== undefined) {
      delete req.body.name;
    }
    
    // Validar o tipo antes de criar a unidade
    const { type, ...rest } = req.body;
    if (!['agua', 'esgoto', 'outras'].includes(type)) {
      return res.status(400).json({ message: 'Tipo de unidade inválido.' });
    }

    const newUnit = new Unit({ ...rest, type });
    const savedUnit = await newUnit.save();
    res.status(201).json(savedUnit);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Atualizar unidade
router.patch('/:id', async (req, res) => {
  try {
    // Certifica-se de que o campo 'name' não está presente no req.body, se ele for enviado por engano.
    if (req.body.name !== undefined) {
      delete req.body.name;
    }

    const { type, ...updateData } = req.body;

    if (type && !['agua', 'esgoto', 'outras'].includes(type)) {
      return res.status(400).json({ message: 'Tipo de unidade inválido.' });
    }

    const updatedUnit = await Unit.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Use req.body diretamente para incluir o tipo se fornecido
      { new: true, runValidators: true }
    );

    if (!updatedUnit) {
      return res.status(404).json({ message: 'Unidade não encontrada' });
    }

    res.json(updatedUnit);
  } catch (error) {
    console.error(error);
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
    await unit.deleteOne();
    res.json({ message: 'Unidade removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
// Pequena alteração para forçar novo deploy e reavaliação das rotas 