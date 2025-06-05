const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'energy-manager';

// Buscar todos os dados de controle EDP
router.get('/api/edp-control', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('edp-control');
    
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados de controle EDP:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    await client.close();
  }
});

// Salvar ou atualizar dados de controle EDP
router.post('/api/edp-control', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('edp-control');
    
    const { month, data } = req.body;
    
    await collection.updateOne(
      { month },
      { $set: data },
      { upsert: true }
    );
    
    res.json({ message: 'Dados salvos com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar dados de controle EDP:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    await client.close();
  }
});

module.exports = router; 