import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

const UnitView = ({ type }) => {
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totals, setTotals] = useState({
    consumoMedio: 0,
    consumoTotal: 0,
    valorMedio: 0,
    valorTotal: 0
  });

  useEffect(() => {
    fetchUnits();
  }, [type]);

  useEffect(() => {
    if (selectedUnit) {
      fetchMonthlyData();
    }
  }, [selectedUnit]);

  const fetchUnits = async () => {
    try {
      const response = await fetch(`/api/units?type=${type}`);
      const data = await response.json();
      setUnits(data);
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await fetch(`/api/units/${selectedUnit._id}/monthly-data`);
      const data = await response.json();
      setMonthlyData(data);
      
      // Calcular totais
      const consumoTotal = data.reduce((sum, item) => sum + item.potenciaAtiva, 0);
      const valorTotal = data.reduce((sum, item) => sum + item.valor, 0);
      
      setTotals({
        consumoMedio: consumoTotal / data.length,
        consumoTotal,
        valorMedio: valorTotal / data.length,
        valorTotal
      });
    } catch (error) {
      console.error('Erro ao buscar dados mensais:', error);
    }
  };

  const filteredUnits = units.filter(unit => 
    unit.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.numeroInstalacao.includes(searchTerm)
  );

  return (
    <div className="unit-view">
      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Buscar por nome ou número de instalação..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="units-grid">
        {filteredUnits.map(unit => (
          <div
            key={unit._id}
            className={`unit-card ${selectedUnit?._id === unit._id ? 'selected' : ''}`}
            onClick={() => setSelectedUnit(unit)}
          >
            <h3>{unit.nome}</h3>
            <p>Instalação: {unit.numeroInstalacao}</p>
          </div>
        ))}
      </div>

      {selectedUnit && (
        <div className="monthly-data">
          <h3>Dados Mensais - {selectedUnit.nome}</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data da Leitura</th>
                  <th>Vencimento</th>
                  <th>Potência Ativa (kWh)</th>
                  <th>Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map(data => (
                  <tr key={data._id}>
                    <td>{new Date(data.dataLeitura).toLocaleDateString()}</td>
                    <td>{new Date(data.vencimento).toLocaleDateString()}</td>
                    <td>{data.potenciaAtiva.toLocaleString('pt-BR')}</td>
                    <td>{data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2">Totais:</td>
                  <td>
                    <div>Média: {totals.consumoMedio.toLocaleString('pt-BR')} kWh</div>
                    <div>Total: {totals.consumoTotal.toLocaleString('pt-BR')} kWh</div>
                  </td>
                  <td>
                    <div>Média: {totals.valorMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    <div>Total: {totals.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        .unit-view {
          padding: 20px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          padding: 10px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .search-bar input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
        }

        .units-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .unit-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .unit-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .unit-card.selected {
          border: 2px solid #3498db;
        }

        .unit-card h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
        }

        .unit-card p {
          margin: 0;
          color: #7f8c8d;
        }

        .monthly-data {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .table-container {
          overflow-x: auto;
          margin-top: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          background: #f8f9fa;
          font-weight: 500;
          color: #2c3e50;
        }

        tfoot {
          font-weight: 500;
          background: #f8f9fa;
        }

        tfoot td {
          padding: 15px 12px;
        }

        @media (max-width: 768px) {
          .units-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default UnitView; 