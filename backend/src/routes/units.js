const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const MonthlyData = require('../models/MonthlyData');

// Listar unidades
router.get('/', async (req, res) => {
  try {
    const units = await Unit.find();
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
  try {
    const newUnit = new Unit(req.body);
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
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unidade não encontrada' });
    }

    Object.keys(req.body).forEach(key => {
      if (unit[key] !== undefined) {
        unit[key] = req.body[key];
      }
    });

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
    await unit.deleteOne();
    res.json({ message: 'Unidade removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
// Pequena alteração para forçar novo deploy e reavaliação das rotas 