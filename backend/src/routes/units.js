const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const MonthlyData = require('../models/MonthlyData');

// Listar unidades
router.get('/', async (req, res) => {
  try {
    const units = await Unit.find().sort({ createdAt: -1 });
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
  try {
    const unit = new Unit({
      installationNumber: req.body.installationNumber,
      addressSAAE: req.body.addressSAAE,
      addressEDP: req.body.addressEDP,
      station: req.body.station,
      meter: req.body.meter,
      class: req.body.class,
      mapLink: req.body.mapLink,
      status: req.body.status,
      bandeira: req.body.bandeira
    });

    const newUnit = await unit.save();
    res.status(201).json(newUnit);
  } catch (error) {
    console.error('Erro ao criar unidade:', error);
    res.status(400).json({ 
      message: 'Erro ao criar unidade',
      error: error.message 
    });
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