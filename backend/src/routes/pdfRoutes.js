const express = require('express');
const router = express.Router();
// const multer = require('multer'); // Movido para server.js
// const path = require('path'); // Movido para server.js
const pdfController = require('../controllers/pdfController');

// Configuração do Multer para upload de arquivos (Movido para server.js)
// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, path.join(__dirname, '..', '..', 'uploads'));
//     },
//     filename: function(req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype === 'application/pdf') {
//             cb(null, true);
//         } else {
//             cb(new Error('Apenas arquivos PDF são permitidos'));
//         }
//     },
//     limits: {
//         fileSize: 10 * 1024 * 1024 // Limite de 10MB
//     }
// });

// Rotas
// A rota /process-pdf será definida diretamente em server.js
// router.post('/process-pdf', upload.single('file'), pdfController.uploadPDF);
router.get('/', pdfController.listPDFs);
router.get('/:id', pdfController.getPDF);
router.delete('/:id', pdfController.deletePDF);

module.exports = router; 