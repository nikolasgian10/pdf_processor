const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const MonthlyData = require('../models/MonthlyData');

// Buscar estatísticas por tipo
router.get('/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    const currentYear = new Date().getFullYear();

    // Buscar todas as unidades do tipo
    const units = await Unit.find({ tipo });

    // Buscar dados mensais de todas as unidades do tipo
    const monthlyData = await MonthlyData.find({
      unit: { $in: units.map(u => u._id) },
      ano: currentYear
    }).populate('unit');

    // Agrupar dados por mês
    const monthlyStats = {};
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    months.forEach(mes => {
      monthlyStats[mes] = {
        mes,
        consumo: 0,
        valor: 0
      };
    });

    monthlyData.forEach(data => {
      monthlyStats[data.mes].consumo += data.potenciaAtiva;
      monthlyStats[data.mes].valor += data.valor;
    });

    // Calcular totais por tipo
    const totals = {
      totalAgua: { consumo: 0, valor: 0 },
      totalEsgoto: { consumo: 0, valor: 0 },
      totalOutras: { consumo: 0, valor: 0 }
    };

    const allMonthlyData = await MonthlyData.find({
      ano: currentYear
    }).populate('unit');

    allMonthlyData.forEach(data => {
      if (data.unit.tipo === 'agua') {
        totals.totalAgua.consumo += data.potenciaAtiva;
        totals.totalAgua.valor += data.valor;
      } else if (data.unit.tipo === 'esgoto') {
        totals.totalEsgoto.consumo += data.potenciaAtiva;
        totals.totalEsgoto.valor += data.valor;
      } else {
        totals.totalOutras.consumo += data.potenciaAtiva;
        totals.totalOutras.valor += data.valor;
      }
    });

    res.json({
      monthlyStats: Object.values(monthlyStats),
      ...totals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 