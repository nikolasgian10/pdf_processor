const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Rota para obter estatísticas de água
router.get('/agua', async (req, res) => {
  try {
    const totalAgua = await Bill.aggregate([
      { $match: { type: 'agua' } },
      {
        $group: {
          _id: null,
          consumo: { $sum: '$consumption' },
          valor: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyStats = await Bill.aggregate([
      { $match: { type: 'agua' } },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          consumo: { $sum: '$consumption' },
          valor: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          mes: { $concat: ['$_id.month', '/', '$_id.year'] },
          consumo: 1,
          valor: 1
        }
      },
      { $sort: { 'mes': 1 } }
    ]);

    res.json({
      totalAgua: totalAgua[0] || { consumo: 0, valor: 0 },
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para obter estatísticas de esgoto
router.get('/esgoto', async (req, res) => {
  try {
    const totalEsgoto = await Bill.aggregate([
      { $match: { type: 'esgoto' } },
      {
        $group: {
          _id: null,
          consumo: { $sum: '$consumption' },
          valor: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyStats = await Bill.aggregate([
      { $match: { type: 'esgoto' } },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          consumo: { $sum: '$consumption' },
          valor: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          mes: { $concat: ['$_id.month', '/', '$_id.year'] },
          consumo: 1,
          valor: 1
        }
      },
      { $sort: { 'mes': 1 } }
    ]);

    res.json({
      totalEsgoto: totalEsgoto[0] || { consumo: 0, valor: 0 },
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para obter estatísticas de outras áreas
router.get('/outras', async (req, res) => {
  try {
    const totalOutras = await Bill.aggregate([
      { $match: { type: 'outras' } },
      {
        $group: {
          _id: null,
          consumo: { $sum: '$consumption' },
          valor: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyStats = await Bill.aggregate([
      { $match: { type: 'outras' } },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          consumo: { $sum: '$consumption' },
          valor: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          mes: { $concat: ['$_id.month', '/', '$_id.year'] },
          consumo: 1,
          valor: 1
        }
      },
      { $sort: { 'mes': 1 } }
    ]);

    res.json({
      totalOutras: totalOutras[0] || { consumo: 0, valor: 0 },
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 