import React, { useState, useEffect } from 'react';
import { FaUpload, FaSpinner } from 'react-icons/fa';

const PDFUpload = ({ onUpload, selectedType }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [units, setUnits] = useState([]);
  const [existingUnits, setExistingUnits] = useState([]);
  const [newUnit, setNewUnit] = useState({
    installationNumber: '',
    location: '',
    station: '',
    meterNumber: '',
    class: '',
    type: selectedType
  });
  const [isNewUnit, setIsNewUnit] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchExistingUnits();
  }, [selectedType]);

  const fetchExistingUnits = async () => {
    try {
      const response = await fetch(`/api/units/type/${selectedType}`);
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
    if (!file || !selectedType || (!selectedUnit && !isNewUnit)) {
      alert("Por favor, selecione o tipo, a unidade e o arquivo PDF");
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
      formData.append('type', selectedType);
      formData.append('month', selectedMonth);
      formData.append('year', selectedYear.toString());
      
      if (isNewUnit) {
        formData.append('newUnit', JSON.stringify({...newUnit, type: selectedType}));
      } else {
        formData.append('unit', selectedUnit);
      }

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        onUpload(data);
        fetchExistingUnits(); // Refresh units list
        // Reset form
        setFile(null);
        setSelectedMonth('');
        if (isNewUnit) {
          setNewUnit({
            installationNumber: '',
            location: '',
            station: '',
            meterNumber: '',
            class: '',
            type: selectedType
          });
        }
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
        <div className="selection-type">
          <label>
            <input
              type="radio"
              checked={!isNewUnit}
              onChange={() => setIsNewUnit(false)}
            />
            Selecionar Unidade Existente
          </label>
          <label>
            <input
              type="radio"
              checked={isNewUnit}
              onChange={() => setIsNewUnit(true)}
            />
            Nova Unidade
          </label>
        </div>

        {!isNewUnit ? (
          <div className="existing-unit">
            <label>Selecione a Unidade:</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
            >
              <option value="">Selecione...</option>
              {existingUnits.map(unit => (
                <option key={unit._id} value={unit.installationNumber}>
                  {unit.location} - Instalação: {unit.installationNumber}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="new-unit-form">
            <h4>Nova Unidade</h4>
            <div className="form-group">
              <label>Número da Instalação:</label>
              <input
                type="text"
                value={newUnit.installationNumber}
                onChange={(e) => setNewUnit({...newUnit, installationNumber: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Local de Consumo:</label>
              <input
                type="text"
                value={newUnit.location}
                onChange={(e) => setNewUnit({...newUnit, location: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Estação:</label>
              <input
                type="text"
                value={newUnit.station}
                onChange={(e) => setNewUnit({...newUnit, station: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Medidor:</label>
              <input
                type="text"
                value={newUnit.meterNumber}
                onChange={(e) => setNewUnit({...newUnit, meterNumber: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Classe:</label>
              <input
                type="text"
                value={newUnit.class}
                onChange={(e) => setNewUnit({...newUnit, class: e.target.value})}
              />
            </div>
          </div>
        )}

        <div className="date-selection">
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
      </div>
      
      <div className="upload-area">
        <input 
          type="file" 
          accept=".pdf" 
          onChange={(e) => setFile(e.target.files[0])} 
        />
        <button 
          onClick={handleFileUpload} 
          disabled={isProcessing || !file || (!selectedUnit && !isNewUnit) || !selectedMonth || !selectedYear}
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

        .selection-type {
          margin-bottom: 20px;
          display: flex;
          gap: 20px;
        }

        .selection-type label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
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

        .new-unit-form {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .new-unit-form h4 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #2c3e50;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .date-selection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
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
          .selection-type {
            flex-direction: column;
          }

          .date-selection {
            grid-template-columns: 1fr;
          }

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