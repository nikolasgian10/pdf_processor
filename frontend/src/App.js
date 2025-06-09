import React, { useState } from "react";
import { PDFDocument } from 'pdf-lib';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { 
  FaUpload, 
  FaWater, 
  FaToilet, 
  FaBuilding, 
  FaCalculator,
  FaExclamationTriangle,
  FaList,
  FaChartBar,
  FaChartLine,
  FaPlus
} from "react-icons/fa";
import PDFUpload from './components/PDFUpload';
import AddUnit from './components/AddUnit';
import Calculations from './components/Calculations';
import Control from './components/Control';
import Occurrences from './components/Occurrences';
import UnitView from './components/UnitView';
import TotalView from './components/TotalView';
import Graphs from './components/Graphs';
import './App.css';

Chart.register(...registerables);

const App = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedType, setSelectedType] = useState(null);
  const [allData, setAllData] = useState(() => {
    const savedData = localStorage.getItem('pdfProcessorData');
    return savedData ? JSON.parse(savedData) : {
      agua: {},
      esgoto: {},
      outras: {}
    };
  });

  const handleFileUpload = async (file) => {
    if (!file || !selectedType) {
      alert("Selecione o tipo e o arquivo PDF primeiro");
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Por favor, selecione um arquivo PDF");
      return;
    }
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      let pdfText = "";
      
      for (const page of pages) {
        const text = await page.getTextContent();
        pdfText += text.items.map(item => item.str).join(' ');
      }

      const extractedData = extractDataFromPDF(pdfText, selectedType);
      
      const newData = {
        ...allData,
        [selectedType]: {
          ...allData[selectedType],
          [extractedData.medidor]: extractedData
        }
      };
      
      setAllData(newData);
      localStorage.setItem('pdfProcessorData', JSON.stringify(newData));
    } catch (error) {
      console.error("Erro ao processar PDF:", error);
      alert("Erro ao processar o arquivo PDF. Verifique se o arquivo não está protegido ou corrompido.");
    }
  };

  const extractDataFromPDF = (pdfText, type) => {
    const unidadeMatch = pdfText.match(/Unidade:\s*([^\n]+)/i);
    const medidorMatch = pdfText.match(/Medidor:\s*(\d+)/i);
    const enderecoMatch = pdfText.match(/Endereço:\s*([^\n]+)/i);
    
    const valores = pdfText.match(/R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{2})/g) || [];
    
    const meses = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    
    const monthlyData = {};
    meses.forEach((mes, index) => {
      if (valores[index]) {
        const valorNumerico = parseFloat(valores[index]
          .replace("R$", "")
          .replace(".", "")
          .replace(",", "."));
        
        monthlyData[mes] = {
          valor: valores[index],
          valorNumerico,
          demanda: 0,
          tributos: 0,
          total: 0
        };
      }
    });
    
    const valoresNumericos = Object.values(monthlyData).map(item => item.valorNumerico);
    const totalValor = valoresNumericos.reduce((sum, val) => sum + val, 0);
    const demandaMedia = totalValor / (valoresNumericos.length || 1);
    
    Object.keys(monthlyData).forEach(mes => {
      monthlyData[mes].tributos = monthlyData[mes].valorNumerico * 0.21;
      monthlyData[mes].demanda = demandaMedia * 0.7;
      monthlyData[mes].total = monthlyData[mes].valorNumerico + monthlyData[mes].tributos + monthlyData[mes].demanda;
    });
    
    return {
      unidade: unidadeMatch ? unidadeMatch[1].trim() : "Unidade não identificada",
      medidor: medidorMatch ? medidorMatch[1] : "N/A",
      endereco: enderecoMatch ? enderecoMatch[1].trim() : "Endereço não encontrado",
      meses: monthlyData,
      totalGeral: totalValor,
      demandaMedia,
      tipo: type
    };
  };

  const handleUnitAdded = (data) => {
    console.log('Unit added:', data);
    // Handle the new unit data
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="processing-section">
            <div className="type-selection">
              <h2>Selecione o Tipo</h2>
              <div className="type-buttons">
                <button 
                  className={selectedType === 'agua' ? 'active' : ''} 
                  onClick={() => setSelectedType('agua')}
                >
                  <FaWater /> Água
                </button>
                <button 
                  className={selectedType === 'esgoto' ? 'active' : ''} 
                  onClick={() => setSelectedType('esgoto')}
                >
                  <FaToilet /> Esgoto
                </button>
                <button 
                  className={selectedType === 'outras' ? 'active' : ''} 
                  onClick={() => setSelectedType('outras')}
                >
                  <FaBuilding /> Outras Áreas
                </button>
              </div>
            </div>
            {selectedType && <PDFUpload onUpload={handleFileUpload} selectedType={selectedType} />}
          </div>
        );
      case 'add-unit':
        return <AddUnit onUnitAdded={handleUnitAdded} />;
      case 'calculations':
        return <Calculations />;
      case 'control':
        return <Control />;
      case 'water':
        return <UnitView type="agua" />;
      case 'sewage':
        return <UnitView type="esgoto" />;
      case 'other':
        return <UnitView type="outras" />;
      case 'occurrences':
        return <Occurrences />;
      case 'totals':
        return <TotalView />;
      case 'graphs':
        return <Graphs />;
      default:
        return <PDFUpload onUpload={handleFileUpload} />;
    }
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="logo">
          <h1>PDF Processor</h1>
        </div>
        <ul className="nav-links">
          <li 
            className={activeTab === 'upload' ? 'active' : ''}
            onClick={() => setActiveTab('upload')}
          >
            <FaUpload /> Upload PDF
          </li>
          <li 
            className={activeTab === 'add-unit' ? 'active' : ''}
            onClick={() => setActiveTab('add-unit')}
          >
            <FaPlus /> Nova Unidade
          </li>
          <li 
            className={activeTab === 'calculations' ? 'active' : ''}
            onClick={() => setActiveTab('calculations')}
          >
            <FaCalculator /> Cálculos
          </li>
          <li 
            className={activeTab === 'control' ? 'active' : ''}
            onClick={() => setActiveTab('control')}
          >
            <FaList /> Controle
          </li>
          <li 
            className={activeTab === 'water' ? 'active' : ''}
            onClick={() => setActiveTab('water')}
          >
            <FaWater /> Água
          </li>
          <li 
            className={activeTab === 'sewage' ? 'active' : ''}
            onClick={() => setActiveTab('sewage')}
          >
            <FaToilet /> Esgoto
          </li>
          <li 
            className={activeTab === 'other' ? 'active' : ''}
            onClick={() => setActiveTab('other')}
          >
            <FaBuilding /> Outras Áreas
          </li>
          <li 
            className={activeTab === 'occurrences' ? 'active' : ''}
            onClick={() => setActiveTab('occurrences')}
          >
            <FaExclamationTriangle /> Ocorrências
          </li>
          <li 
            className={activeTab === 'totals' ? 'active' : ''}
            onClick={() => setActiveTab('totals')}
          >
            <FaChartBar /> Totais
          </li>
          <li 
            className={activeTab === 'graphs' ? 'active' : ''}
            onClick={() => setActiveTab('graphs')}
          >
            <FaChartLine /> Gráficos
          </li>
        </ul>
      </nav>

      <main className="content">
        {renderContent()}
      </main>

      <style jsx>{`
        .app {
          display: flex;
          height: 100vh;
          background: #f8f9fa;
        }
        
        .sidebar {
          width: 250px;
          background: white;
          color: #2c3e50;
          padding: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }
        
        .logo {
          padding: 20px 0;
          border-bottom: 1px solid #eee;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .logo img {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }

        .logo h1 {
          margin: 0;
          font-size: 20px;
          color: #2c3e50;
        }

        .nav-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-links li {
          padding: 12px 15px;
          margin: 5px 0;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
          color: #2c3e50;
        }
        
        .nav-links li:hover {
          background: #f8f9fa;
          color: #3498db;
        }

        .nav-links li.active {
          background: #3498db;
          color: white;
        }

        .content {
          flex: 1;
          overflow-y: auto;
          background: #f8f9fa;
        }

        .unit-content {
          padding: 20px;
        }
        
        .unit-content h2 {
          margin-top: 0;
          color: #2c3e50;
        }
        
        .processing-section {
          padding: 20px;
        }

        .type-selection {
          margin-bottom: 30px;
          text-align: center;
        }

        .type-selection h2 {
          margin-bottom: 20px;
          color: #2c3e50;
        }

        .type-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .type-buttons button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: 2px solid #3498db;
          background: white;
          color: #3498db;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
        }

        .type-buttons button:hover {
          background: #f7f9fc;
        }

        .type-buttons button.active {
          background: #3498db;
          color: white;
        }

        @media (max-width: 768px) {
          .app {
            flex-direction: column;
          }
          
          .sidebar {
            width: 100%;
            padding: 10px;
          }

          .logo {
            padding: 10px 0;
          }
          
          .nav-links {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
          }

          .nav-links li {
            flex: 1;
            min-width: 120px;
            text-align: center;
            justify-content: center;
          }

          .content {
            height: calc(100vh - 200px);
          }

          .type-buttons {
            flex-direction: column;
            align-items: center;
          }

          .type-buttons button {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default App;