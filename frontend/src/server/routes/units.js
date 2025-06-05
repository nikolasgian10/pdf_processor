const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');

// Rota para buscar todas as unidades
router.get('/', async (req, res) => {
  try {
    const units = await Unit.find().sort({ location: 1 });
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para criar uma nova unidade
router.post('/', async (req, res) => {
  try {
    const unit = new Unit(req.body);
    const savedUnit = await unit.save();
    res.status(201).json(savedUnit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para atualizar uma unidade
router.patch('/:id', async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!unit) {
      return res.status(404).json({ message: 'Unidade não encontrada' });
    }
    res.json(unit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para excluir uma unidade
router.delete('/:id', async (req, res) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unidade não encontrada' });
    }
    res.json({ message: 'Unidade excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 