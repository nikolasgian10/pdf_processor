import React, { useState, useEffect } from 'react';
import { FaUpload, FaSpinner } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'https://pdf-processor-backend.onrender.com/api';

// Verificação da URL da API
console.log('URL da API configurada:', API_URL);

const PDFUpload = ({ onUpload, selectedType }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [existingUnits, setExistingUnits] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchExistingUnits();
  }, [selectedType]);

  const fetchExistingUnits = async () => {
    try {
      const url = selectedType ? `${API_URL}/units?type=${encodeURIComponent(selectedType)}` : `${API_URL}/units`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao buscar unidades');
      }
      const data = await response.json();
      setExistingUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
      setExistingUnits([]);
    }
  };

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  const handleFileUpload = async () => {
    console.log("=== Início de handleFileUpload ===");
    console.log("1. Verificação do arquivo:");
    console.log("- Arquivo selecionado:", file);
    console.log("- Nome do arquivo:", file?.name);
    console.log("- Tipo do arquivo:", file?.type);
    console.log("- Tamanho do arquivo:", file?.size);

    console.log("\n2. Verificação dos campos:");
    console.log("- Unidade selecionada:", selectedUnit);
    console.log("- Mês selecionado:", selectedMonth);
    console.log("- Ano selecionado:", selectedYear);

    if (!file || !selectedUnit) {
      alert("Por favor, selecione a unidade e o arquivo PDF");
      return;
    }

    if (!selectedMonth || !selectedYear) {
      alert("Por favor, selecione o mês e ano da conta");
      return;
    }

    // Validação mais robusta do arquivo PDF
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const fileType = file.type;
    
    console.log("\n3. Validação do arquivo:");
    console.log("- Extensão do arquivo:", fileExtension);
    console.log("- Tipo MIME:", fileType);
    
    if (fileExtension !== 'pdf' || fileType !== 'application/pdf') {
      alert("Por favor, selecione um arquivo PDF válido");
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log("\n4. Preparando FormData:");
      const formData = new FormData();
      formData.append('file', file);
      formData.append('month', selectedMonth);
      formData.append('year', selectedYear.toString());
      formData.append('unit', selectedUnit);

      console.log("\n5. Conteúdo do FormData:");
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      console.log("\n6. Enviando requisição para:", `${API_URL}/pdfs/process-pdf`);
      
      const response = await fetch(`${API_URL}/pdfs/process-pdf`, {
        method: 'POST',
        body: formData,
      });

      console.log("\n7. Resposta do servidor:");
      console.log("- Status:", response.status);
      console.log("- Status Text:", response.statusText);
      
      const data = await response.json();
      console.log("- Dados:", data);
      
      if (response.ok) {
        onUpload(data);
        setFile(null);
        setSelectedMonth('');
      } else {
        throw new Error(data.message || 'Erro ao processar PDF');
      }
    } catch (error) {
      console.error("Erro ao processar PDF:", error);
      alert("Erro ao processar o arquivo PDF. Verifique se o arquivo não está protegido ou corrompido.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="unit-selection">
        <div className="existing-unit">
          <label>Selecione a Unidade:</label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
          >
            <option value="">Selecione...</option>
            {existingUnits.map(unit => (
              <option key={unit._id} value={unit.installationNumber}>
                {unit.installationNumber} - SAAE: {unit.addressSAAE} | EDP: {unit.addressEDP}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Mês da Conta:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {months.map((month, index) => (
              <option key={index} value={month.toLowerCase()}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Ano da Conta:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            required
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="upload-area">
        <input 
          type="file" 
          accept=".pdf" 
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            console.log('Arquivo selecionado:', selectedFile);
            setFile(selectedFile);
          }} 
        />
        <button 
          onClick={handleFileUpload} 
          disabled={isProcessing || !file || !selectedUnit || !selectedMonth || !selectedYear}
        >
          {isProcessing ? (
            <>
              <FaSpinner className="spinner" /> Processando...
            </>
          ) : (
            <>
              <FaUpload /> Processar Arquivo
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .upload-container {
          margin: 20px 0;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .unit-selection {
          margin-bottom: 20px;
        }

        .existing-unit {
          margin-bottom: 20px;
        }

        .existing-unit label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .existing-unit select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .upload-area {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .upload-area input[type="file"] {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .upload-area button {
          padding: 10px 15px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .upload-area button:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .upload-area {
            flex-direction: column;
          }

          .upload-area button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default PDFUpload; 