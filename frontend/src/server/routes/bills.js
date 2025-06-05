const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Rota para buscar contas com filtros
router.get('/', async (req, res) => {
  try {
    const { unit, type, month, year, status, startDate, endDate } = req.query;
    const query = {};

    if (unit) query['unit._id'] = unit;
    if (type) query.type = type;
    if (month) query.month = month;
    if (year) query.year = year;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.readingDate = {};
      if (startDate) query.readingDate.$gte = new Date(startDate);
      if (endDate) query.readingDate.$lte = new Date(endDate);
    }

    const bills = await Bill.find(query)
      .populate('unit')
      .sort({ readingDate: -1 });

    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para criar uma nova conta
router.post('/', async (req, res) => {
  try {
    const bill = new Bill(req.body);
    const savedBill = await bill.save();
    res.status(201).json(savedBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para atualizar uma conta
router.patch('/:id', async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!bill) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para excluir uma conta
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    res.json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 