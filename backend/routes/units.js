const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');

// POST /api/units
router.post('/', async (req, res) => {
  try {
    const newUnit = new Unit(req.body);
    const saved = await newUnit.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar unidade' });
  }
});

// GET /api/units
router.get('/', async (req, res) => {
  try {
    const units = await Unit.find();
    res.json(units);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar unidades' });
  }
});

module.exports = router; 