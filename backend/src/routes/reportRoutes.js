const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const moment = require('moment');

// Get report data for a specific unit
router.get('/:installationNumber', async (req, res) => {
  try {
    const { installationNumber } = req.params;
    const { start, end } = req.query;

    const unit = await Unit.findOne({ installationNumber });
    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    let monthlyData = unit.monthlyData;

    // Filter by date range if provided
    if (start && end) {
      const startDate = moment(start);
      const endDate = moment(end);

      monthlyData = monthlyData.filter(data => {
        const dataDate = moment(`${data.year}-${monthToNumber(data.month) + 1}-01`);
        return dataDate.isBetween(startDate, endDate, 'month', '[]');
      });
    }

    // Sort data by date
    monthlyData.sort((a, b) => {
      const dateA = moment(`${a.year}-${monthToNumber(a.month) + 1}-01`);
      const dateB = moment(`${b.year}-${monthToNumber(b.month) + 1}-01`);
      return dateA - dateB;
    });

    // Calculate summary statistics
    const summary = {
      totalConsumption: 0,
      totalAmount: 0,
      averageConsumption: 0,
      averageAmount: 0,
      peakDemand: 0,
      averageDemand: 0
    };

    monthlyData.forEach(data => {
      summary.totalConsumption += data.consumption || 0;
      summary.totalAmount += data.amount || 0;
      summary.peakDemand = Math.max(summary.peakDemand, data.demand?.measured || 0);
    });

    if (monthlyData.length > 0) {
      summary.averageConsumption = summary.totalConsumption / monthlyData.length;
      summary.averageAmount = summary.totalAmount / monthlyData.length;
      summary.averageDemand = monthlyData.reduce((sum, data) => sum + (data.demand?.measured || 0), 0) / monthlyData.length;
    }

    res.json({
      unitInfo: {
        installationNumber: unit.installationNumber,
        location: unit.location,
        type: unit.type,
        meterNumber: unit.meterNumber,
        class: unit.class
      },
      monthlyData,
      summary
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
});

// Get consumption statistics by type
router.get('/stats/by-type', async (req, res) => {
  try {
    const stats = {
      agua: { total: 0, count: 0 },
      esgoto: { total: 0, count: 0 },
      outras: { total: 0, count: 0 }
    };

    const units = await Unit.find({});

    units.forEach(unit => {
      const unitStats = unit.calculateStats();
      stats[unit.type].total += unitStats.totalConsumption;
      stats[unit.type].count++;
    });

    // Calculate averages
    Object.keys(stats).forEach(type => {
      if (stats[type].count > 0) {
        stats[type].average = stats[type].total / stats[type].count;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Error calculating statistics:', error);
    res.status(500).json({ error: 'Error calculating statistics' });
  }
});

// Get monthly consumption data for all units
router.get('/consumption/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    const units = await Unit.find({});

    const monthlyData = {
      agua: Array(12).fill(0),
      esgoto: Array(12).fill(0),
      outras: Array(12).fill(0)
    };

    units.forEach(unit => {
      unit.monthlyData
        .filter(data => !year || data.year === parseInt(year))
        .forEach(data => {
          const monthIndex = monthToNumber(data.month);
          monthlyData[unit.type][monthIndex] += data.consumption || 0;
        });
    });

    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly consumption:', error);
    res.status(500).json({ error: 'Error fetching monthly consumption' });
  }
});

// Helper function to convert month name to number (0-11)
function monthToNumber(month) {
  const months = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
    'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
    'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
  };
  return months[month.toLowerCase()];
}

module.exports = router; 