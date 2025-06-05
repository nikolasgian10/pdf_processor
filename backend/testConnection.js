const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('Tentando conectar ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conexão com MongoDB estabelecida com sucesso!');
        
        // Criar uma coleção de teste
        const TestModel = mongoose.model('Test', new mongoose.Schema({
            message: String,
            date: { type: Date, default: Date.now }
        }));

        // Inserir um documento de teste
        await TestModel.create({ message: 'Teste de conexão' });
        console.log('Documento de teste criado com sucesso!');

        // Buscar o documento
        const doc = await TestModel.findOne({ message: 'Teste de conexão' });
        console.log('Documento encontrado:', doc);

        // Limpar o documento de teste
        await TestModel.deleteMany({});
        console.log('Documento de teste removido');

    } catch (error) {
        console.error('Erro ao conectar com MongoDB:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Conexão fechada');
    }
}

testConnection(); 