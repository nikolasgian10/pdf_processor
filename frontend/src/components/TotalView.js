import React, { useState, useEffect } from 'react';
import { FaCalculator, FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const TotalView = () => {
  const [totals, setTotals] = useState({
    agua: {
      consumo: 0,
      valor: 0,
      unidades: 0
    },
    esgoto: {
      consumo: 0,
      valor: 0,
      unidades: 0
    },
    outras: {
      consumo: 0,
      valor: 0,
      unidades: 0
    }
  });

  useEffect(() => {
    fetchTotals();
  }, []);

  const fetchTotals = async () => {
    try {
      const response = await fetch('/api/totals');
      const data = await response.json();
      setTotals(data);
    } catch (error) {
      console.error('Erro ao buscar totais:', error);
    }
  };

  const exportToExcel = () => {
    const data = [
      {
        'Área': 'Água',
        'Consumo Total (kWh)': totals.agua.consumo,
        'Valor Total (R$)': totals.agua.valor,
        'Número de Unidades': totals.agua.unidades
      },
      {
        'Área': 'Esgoto',
        'Consumo Total (kWh)': totals.esgoto.consumo,
        'Valor Total (R$)': totals.esgoto.valor,
        'Número de Unidades': totals.esgoto.unidades
      },
      {
        'Área': 'Outras Áreas',
        'Consumo Total (kWh)': totals.outras.consumo,
        'Valor Total (R$)': totals.outras.valor,
        'Número de Unidades': totals.outras.unidades
      }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Totais");
    XLSX.writeFile(wb, "totais.xlsx");
  };

  return (
    <div className="totals">
      <div className="header">
        <h2>Visão Geral dos Totais</h2>
        <button onClick={exportToExcel} className="export-btn">
          <FaDownload /> Exportar para Excel
        </button>
      </div>

      <div className="cards-grid">
        <div className="total-card agua">
          <h3>Água</h3>
          <div className="stats">
            <div className="stat">
              <label>Consumo Total</label>
              <span>{totals.agua.consumo.toLocaleString('pt-BR')} kWh</span>
            </div>
            <div className="stat">
              <label>Valor Total</label>
              <span>{totals.agua.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="stat">
              <label>Unidades</label>
              <span>{totals.agua.unidades}</span>
            </div>
          </div>
        </div>

        <div className="total-card esgoto">
          <h3>Esgoto</h3>
          <div className="stats">
            <div className="stat">
              <label>Consumo Total</label>
              <span>{totals.esgoto.consumo.toLocaleString('pt-BR')} kWh</span>
            </div>
            <div className="stat">
              <label>Valor Total</label>
              <span>{totals.esgoto.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="stat">
              <label>Unidades</label>
              <span>{totals.esgoto.unidades}</span>
            </div>
          </div>
        </div>

        <div className="total-card outras">
          <h3>Outras Áreas</h3>
          <div className="stats">
            <div className="stat">
              <label>Consumo Total</label>
              <span>{totals.outras.consumo.toLocaleString('pt-BR')} kWh</span>
            </div>
            <div className="stat">
              <label>Valor Total</label>
              <span>{totals.outras.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="stat">
              <label>Unidades</label>
              <span>{totals.outras.unidades}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .totals {
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header h2 {
          margin: 0;
          color: #2c3e50;
        }

        .export-btn {
          padding: 10px 20px;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .total-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .total-card h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          text-align: center;
        }

        .stats {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .stat label {
          color: #666;
          font-size: 0.9em;
        }

        .stat span {
          font-weight: 600;
          color: #2c3e50;
        }

        .agua { border-top: 4px solid #3498db; }
        .esgoto { border-top: 4px solid #e74c3c; }
        .outras { border-top: 4px solid #2ecc71; }

        @media (max-width: 1024px) {
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: 1fr;
          }

          .header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default TotalView; 