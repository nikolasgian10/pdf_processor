const PDF = require('../models/PDF');
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');

// Configuração do diretório de upload
const uploadDir = path.join(__dirname, '../../uploads');

// Criar diretório de upload se não existir
const ensureUploadDir = async () => {
    try {
        await fs.access(uploadDir);
    } catch {
        await fs.mkdir(uploadDir, { recursive: true });
    }
};

// Controlador para operações com PDF
const pdfController = {
    // Upload e processamento de PDF
    async uploadPDF(req, res) {
        console.log('=== Início do processamento de PDF ===');
        console.log('1. Verificação do request:');
        console.log('- Body:', req.body);
        console.log('- File:', req.file);

        try {
            if (!req.file) {
                console.log('Erro: Nenhum arquivo foi enviado');
                return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
            }

            console.log('\n2. Verificação do arquivo:');
            console.log('- Nome original:', req.file.originalname);
            console.log('- Nome do arquivo:', req.file.filename);
            console.log('- Tamanho:', req.file.size);
            console.log('- Tipo MIME:', req.file.mimetype);
            console.log('- Tipo de armazenamento Multer: MemoryStorage (arquivo em req.file.buffer)');

            // Ler o arquivo PDF do buffer em memória
            console.log('\n4. Lendo arquivo PDF do buffer em memória...');
            const dataBuffer = req.file.buffer;
            const pdfData = await pdfParse(dataBuffer);
            console.log('- Páginas:', pdfData.numpages);
            console.log('- Tamanho do texto:', pdfData.text.length);

            console.log('\n5. Criando registro no banco de dados...');
            // Criar registro no banco de dados
            const pdf = new PDF({
                fileName: req.file.filename,
                originalName: req.file.originalname,
                fileSize: req.file.size,
                processedText: pdfData.text,
                metadata: {
                    pageCount: pdfData.numpages,
                    author: pdfData.info?.Author || 'Não especificado',
                    creationDate: pdfData.info?.CreationDate ? new Date(pdfData.info.CreationDate) : new Date(),
                    keywords: pdfData.info?.Keywords ? pdfData.info.Keywords.split(',') : []
                },
                status: 'processed',
                unit: req.body.unit,
                month: req.body.month,
                year: req.body.year
            });

            await pdf.save();
            console.log('6. Registro salvo com sucesso');

            // Remover arquivo temporário após processamento (não é mais necessário com memoryStorage)
            // await fs.unlink(req.file.path);
            // console.log('7. Arquivo temporário removido');

            console.log('\n8. Enviando resposta de sucesso');
            res.status(201).json(pdf);
        } catch (error) {
            console.error('\nErro no processamento do PDF:', error);
            res.status(500).json({ error: 'Erro no processamento do arquivo' });
        }
    },

    // Listar todos os PDFs processados
    async listPDFs(req, res) {
        try {
            const pdfs = await PDF.find().sort({ uploadDate: -1 });
            res.json(pdfs);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar PDFs' });
        }
    },

    // Buscar PDF por ID
    async getPDF(req, res) {
        try {
            const pdf = await PDF.findById(req.params.id);
            if (!pdf) {
                return res.status(404).json({ error: 'PDF não encontrado' });
            }
            res.json(pdf);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar PDF' });
        }
    },

    // Deletar PDF
    async deletePDF(req, res) {
        try {
            const pdf = await PDF.findByIdAndDelete(req.params.id);
            if (!pdf) {
                return res.status(404).json({ error: 'PDF não encontrado' });
            }
            res.json({ message: 'PDF deletado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao deletar PDF' });
        }
    }
};

module.exports = pdfController; 