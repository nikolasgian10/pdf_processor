const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const cors = require('cors');

const app = require('express')();
app.use(cors());

// Get all units
router.get('/', async (req, res) => {
  try {
    const units = await Unit.find({});
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching units' });
  }
});

// Get a specific unit
router.get('/:id', async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    res.json(unit);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching unit' });
  }
});

// Create a new unit
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
      bandeira: req.body.bandeira,
      status: req.body.status
    });
    const savedUnit = await unit.save();
    res.status(201).json(savedUnit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a unit
router.put('/:id', async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(
      req.params.id,
      {
        installationNumber: req.body.installationNumber,
        addressSAAE: req.body.addressSAAE,
        addressEDP: req.body.addressEDP,
        station: req.body.station,
        meter: req.body.meter,
        class: req.body.class,
        mapLink: req.body.mapLink,
        bandeira: req.body.bandeira,
        status: req.body.status
      },
      { new: true }
    );
    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    res.json(unit);
  } catch (error) {
    res.status(500).json({ error: 'Error updating unit' });
  }
});

// Delete a unit
router.delete('/:id', async (req, res) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting unit' });
  }
});

// Get monthly data for a unit
router.get('/:id/monthly', async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    const { year, month } = req.query;
    let monthlyData = unit.monthlyData;

    if (year) {
      monthlyData = monthlyData.filter(data => data.year === parseInt(year));
    }

    if (month) {
      monthlyData = monthlyData.filter(data => data.month.toLowerCase() === month.toLowerCase());
    }

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching monthly data' });
  }
});

// Get consumption statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    const monthlyData = unit.monthlyData;
    const stats = {
      totalConsumption: 0,
      averageConsumption: 0,
      totalAmount: 0,
      averageAmount: 0,
      monthlyTrend: []
    };

    if (monthlyData.length > 0) {
      stats.totalConsumption = monthlyData.reduce((sum, data) => sum + (data.consumption || 0), 0);
      stats.averageConsumption = stats.totalConsumption / monthlyData.length;
      stats.totalAmount = monthlyData.reduce((sum, data) => sum + (data.amount || 0), 0);
      stats.averageAmount = stats.totalAmount / monthlyData.length;

      // Calculate monthly trend
      stats.monthlyTrend = monthlyData
        .sort((a, b) => new Date(a.readingDate) - new Date(b.readingDate))
        .map(data => ({
          month: data.month,
          year: data.year,
          consumption: data.consumption,
          amount: data.amount
        }));
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error calculating statistics' });
  }
});

module.exports = router; 