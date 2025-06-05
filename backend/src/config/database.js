const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        console.log('Tentando conectar ao MongoDB...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI não está definida no arquivo .env');
        }
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`MongoDB conectado com sucesso: ${conn.connection.host}`);
    } catch (error) {
        console.error('Erro ao conectar com MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB; 