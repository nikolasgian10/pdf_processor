import React, { useState, useEffect } from 'react';
import { FaUpload, FaSpinner } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'https://pdf-processor-backend.onrender.com/api';

const PDFUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [existingUnits, setExistingUnits] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchExistingUnits();
  }, []);

  const fetchExistingUnits = async () => {
    try {
      const response = await fetch(`${API_URL}/units`);
      const data = await response.json();
      setExistingUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
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
    if (!file || !selectedUnit) {
      alert("Por favor, selecione a unidade e o arquivo PDF");
      return;
    }

    if (!selectedMonth || !selectedYear) {
      alert("Por favor, selecione o mês e ano da conta");
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Por favor, selecione um arquivo PDF");
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('month', selectedMonth);
      formData.append('year', selectedYear.toString());
      formData.append('unit', selectedUnit);

      const response = await fetch(`${API_URL}/pdfs/process-pdf`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
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
          onChange={(e) => setFile(e.target.files[0])} 
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