const express = require('express');
const router = express.Router();
const { Control, Empenho } = require('../models/Control');

// Buscar dados mensais
router.get('/monthly', async (req, res) => {
  try {
    const monthlyData = await Control.find().sort({ mes: 1 });
    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Atualizar dados mensais
router.patch('/monthly/:mes', async (req, res) => {
  try {
    let control = await Control.findOne({ mes: req.params.mes });
    if (!control) {
      control = new Control({ mes: req.params.mes });
    }

    Object.keys(req.body).forEach(key => {
      if (control.schema.paths[key]) {
        control[key] = req.body[key];
      }
    });

    const updatedControl = await control.save();
    res.json(updatedControl);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Salvar valor do empenho
router.post('/empenho', async (req, res) => {
  const empenho = new Empenho({
    valor: req.body.valor,
    ano: new Date().getFullYear()
  });

  try {
    const newEmpenho = await empenho.save();
    res.status(201).json(newEmpenho);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Buscar valor do empenho atual
router.get('/empenho', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const empenho = await Empenho.findOne({ ano: currentYear })
      .sort({ createdAt: -1 });
    res.json(empenho);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 