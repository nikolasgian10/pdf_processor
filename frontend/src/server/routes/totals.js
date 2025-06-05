const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Rota para obter totais gerais
router.get('/', async (req, res) => {
  try {
    const [aguaTotals, esgotoTotals, outrasTotals] = await Promise.all([
      Bill.aggregate([
        { $match: { type: 'agua' } },
        {
          $group: {
            _id: null,
            consumo: { $sum: '$consumption' },
            valor: { $sum: '$amount' },
            unidades: { $addToSet: '$unit' }
          }
        },
        {
          $project: {
            _id: 0,
            consumo: 1,
            valor: 1,
            unidades: { $size: '$unidades' }
          }
        }
      ]),
      Bill.aggregate([
        { $match: { type: 'esgoto' } },
        {
          $group: {
            _id: null,
            consumo: { $sum: '$consumption' },
            valor: { $sum: '$amount' },
            unidades: { $addToSet: '$unit' }
          }
        },
        {
          $project: {
            _id: 0,
            consumo: 1,
            valor: 1,
            unidades: { $size: '$unidades' }
          }
        }
      ]),
      Bill.aggregate([
        { $match: { type: 'outras' } },
        {
          $group: {
            _id: null,
            consumo: { $sum: '$consumption' },
            valor: { $sum: '$amount' },
            unidades: { $addToSet: '$unit' }
          }
        },
        {
          $project: {
            _id: 0,
            consumo: 1,
            valor: 1,
            unidades: { $size: '$unidades' }
          }
        }
      ])
    ]);

    res.json({
      agua: aguaTotals[0] || { consumo: 0, valor: 0, unidades: 0 },
      esgoto: esgotoTotals[0] || { consumo: 0, valor: 0, unidades: 0 },
      outras: outrasTotals[0] || { consumo: 0, valor: 0, unidades: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 