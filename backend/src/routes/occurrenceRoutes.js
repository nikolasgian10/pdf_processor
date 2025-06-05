const express = require('express');
const router = express.Router();
const Occurrence = require('../models/Occurrence');

// Get all occurrences
router.get('/', async (req, res) => {
  try {
    const { status, unit, priority } = req.query;
    let query = {};

    if (status) query.status = status;
    if (unit) query.unit = unit;
    if (priority) query.priority = priority;

    const occurrences = await Occurrence.find(query)
      .sort({ createdAt: -1 });
    res.json(occurrences);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching occurrences' });
  }
});

// Create a new occurrence
router.post('/', async (req, res) => {
  try {
    const occurrence = new Occurrence(req.body);
    await occurrence.save();
    res.status(201).json(occurrence);
  } catch (error) {
    res.status(500).json({ error: 'Error creating occurrence' });
  }
});

// Get a specific occurrence
router.get('/:id', async (req, res) => {
  try {
    const occurrence = await Occurrence.findById(req.params.id);
    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }
    res.json(occurrence);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching occurrence' });
  }
});

// Update an occurrence
router.patch('/:id', async (req, res) => {
  try {
    const occurrence = await Occurrence.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }
    res.json(occurrence);
  } catch (error) {
    res.status(500).json({ error: 'Error updating occurrence' });
  }
});

// Delete an occurrence
router.delete('/:id', async (req, res) => {
  try {
    const occurrence = await Occurrence.findByIdAndDelete(req.params.id);
    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }
    res.json({ message: 'Occurrence deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting occurrence' });
  }
});

// Add a comment to an occurrence
router.post('/:id/comments', async (req, res) => {
  try {
    const occurrence = await Occurrence.findById(req.params.id);
    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }

    occurrence.comments.push(req.body);
    await occurrence.save();
    res.status(201).json(occurrence);
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// Get statistics about occurrences
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = {
      total: await Occurrence.countDocuments(),
      open: await Occurrence.countDocuments({ status: 'open' }),
      inProgress: await Occurrence.countDocuments({ status: 'in_progress' }),
      closed: await Occurrence.countDocuments({ status: 'closed' }),
      byPriority: {
        low: await Occurrence.countDocuments({ priority: 'low' }),
        normal: await Occurrence.countDocuments({ priority: 'normal' }),
        high: await Occurrence.countDocuments({ priority: 'high' }),
        urgent: await Occurrence.countDocuments({ priority: 'urgent' })
      }
    };

    // Calculate average resolution time for closed occurrences
    const closedOccurrences = await Occurrence.find({ 
      status: 'closed',
      closedAt: { $exists: true }
    });

    if (closedOccurrences.length > 0) {
      const totalTime = closedOccurrences.reduce((sum, occ) => {
        return sum + (occ.closedAt - occ.createdAt);
      }, 0);
      stats.averageResolutionTime = totalTime / closedOccurrences.length;
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error calculating statistics' });
  }
});

module.exports = router; 