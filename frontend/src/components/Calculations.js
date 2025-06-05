import React, { useState, useEffect } from 'react';
import { FaCalculator, FaDownload, FaSearch } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const CALCULO_TYPES = [
  'TUSD - Consumo Ativo Ponta',
  'TUSD - Consumo Ativo Fora Ponta Indutivo',
  'TUSD - Consumo Ativo Fora Ponta Capacitivo',
  'TE - Consumo Ativo Ponta',
  'TE - Consumo Ativo Fora Ponta Indutivo',
  'TE - Consumo Ativo Fora Ponta Capacitivo',
  'Demanda Ponta',
  'Demanda Fora Ponta',
  'Ultrapassagem Ponta',
  'ERE - Energia Reativa Excedente',
  'Subvenção Tarifária',
  'Adicional Bandeira Amarela',
  'Adicional Bandeira Vermelha',
  'Crédito Subvenção Tarifária'
];

const Calculations = () => {
  const [selectedCalc, setSelectedCalc] = useState('');
  const [consumo, setConsumo] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [demandaContratada, setDemandaContratada] = useState('');
  const [demandaMedida, setDemandaMedida] = useState('');
  const [impostos, setImpostos] = useState({
    pis: '',
    cofins: '',
    icms: ''
  });
  const [results, setResults] = useState(null);
  const [consumoMensal, setConsumoMensal] = useState({
    agua: { total: 0, media: 0, demanda: 0 },
    esgoto: { total: 0, media: 0, demanda: 0 },
    outras: { total: 0, media: 0, demanda: 0 }
  });
  const [selectedUnit, setSelectedUnit] = useState('');
  const [units, setUnits] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    fetchConsumoMensal();
    fetchUnits();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      fetchHistoricalData();
    }
  }, [selectedUnit]);

  const fetchConsumoMensal = async () => {
    try {
      const response = await fetch('/api/units/stats/consumo-mensal');
      const data = await response.json();
      setConsumoMensal(data);
    } catch (error) {
      console.error('Erro ao buscar consumo mensal:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units');
      const data = await response.json();
      setUnits(data);
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`/api/units/${selectedUnit}/historical`);
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error('Erro ao buscar dados históricos:', error);
    }
  };

  const calculateTariffs = () => {
    const tarifaDesconto = tarifa * 0.85; // 15% discount
    const somaImpostos = (parseFloat(impostos.pis) + parseFloat(impostos.cofins) + parseFloat(impostos.icms)) / 100;
    let resultado = 0;

    switch (selectedCalc) {
      case 'TUSD - Consumo Ativo Ponta':
      case 'TUSD - Consumo Ativo Fora Ponta Indutivo':
      case 'TUSD - Consumo Ativo Fora Ponta Capacitivo':
      case 'TE - Consumo Ativo Ponta':
      case 'TE - Consumo Ativo Fora Ponta Indutivo':
      case 'TE - Consumo Ativo Fora Ponta Capacitivo':
        resultado = tarifaDesconto * consumo;
        break;

      case 'Demanda Ponta':
      case 'Demanda Fora Ponta':
        resultado = tarifa * demandaContratada;
        break;

      case 'Ultrapassagem Ponta':
        if (demandaMedida > demandaContratada * 1.05) {
          resultado = (demandaMedida - demandaContratada) * tarifa * 2;
        }
        break;

      case 'ERE - Energia Reativa Excedente':
        resultado = consumo * tarifa * 0.92; // Fator de potência padrão
        break;

      case 'Subvenção Tarifária':
      case 'Crédito Subvenção Tarifária':
        resultado = consumo * tarifa * -1; // Crédito é negativo
        break;

      case 'Adicional Bandeira Amarela':
        resultado = consumo * 1.343; // Valor da bandeira amarela
        break;

      case 'Adicional Bandeira Vermelha':
        resultado = consumo * 4.169; // Valor da bandeira vermelha
        break;

      default:
        resultado = 0;
    }

    const tarifaComImpostos = resultado / (1 - somaImpostos);

    setResults({
      tarifaDesconto,
      resultado,
      tarifaComImpostos,
      impostos: {
        pis: resultado * (parseFloat(impostos.pis) / 100),
        cofins: resultado * (parseFloat(impostos.cofins) / 100),
        icms: resultado * (parseFloat(impostos.icms) / 100)
      }
    });
  };

  const exportToExcel = () => {
    if (!results) return;

    const ws = XLSX.utils.json_to_sheet([{
      'Tipo de Cálculo': selectedCalc,
      'Consumo (kWh)': consumo,
      'Tarifa Original (R$)': tarifa,
      'Tarifa com Desconto (15%)': results.tarifaDesconto,
      'Resultado (R$)': results.resultado,
      'PIS (R$)': results.impostos.pis,
      'COFINS (R$)': results.impostos.cofins,
      'ICMS (R$)': results.impostos.icms,
      'Total com Impostos (R$)': results.tarifaComImpostos,
      ...(demandaContratada ? {'Demanda Contratada (kW)': demandaContratada} : {}),
      ...(demandaMedida ? {'Demanda Medida (kW)': demandaMedida} : {})
    }]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cálculos");
    XLSX.writeFile(wb, `calculo_${selectedCalc.toLowerCase().replace(/ /g, '_')}.xlsx`);
  };

  return (
    <div className="calculations-container">
      <div className="unit-selection">
        <h3>Selecione a Unidade</h3>
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
        >
          <option value="">Selecione...</option>
          {units.map(unit => (
            <option key={unit._id} value={unit._id}>
              {unit.location} - Instalação: {unit.installationNumber}
            </option>
          ))}
        </select>
      </div>

      <div className="consumo-mensal">
        <h3>Consumo Mensal por Tipo</h3>
        <div className="consumo-grid">
          <div className="consumo-item">
            <h4>Água</h4>
            <p>Total: {consumoMensal.agua.total.toLocaleString('pt-BR')} kWh</p>
            <p>Média: {consumoMensal.agua.media.toLocaleString('pt-BR')} kWh</p>
            <p>Demanda: {consumoMensal.agua.demanda.toLocaleString('pt-BR')} kW</p>
          </div>
          <div className="consumo-item">
            <h4>Esgoto</h4>
            <p>Total: {consumoMensal.esgoto.total.toLocaleString('pt-BR')} kWh</p>
            <p>Média: {consumoMensal.esgoto.media.toLocaleString('pt-BR')} kWh</p>
            <p>Demanda: {consumoMensal.esgoto.demanda.toLocaleString('pt-BR')} kW</p>
          </div>
          <div className="consumo-item">
            <h4>Outras Áreas</h4>
            <p>Total: {consumoMensal.outras.total.toLocaleString('pt-BR')} kWh</p>
            <p>Média: {consumoMensal.outras.media.toLocaleString('pt-BR')} kWh</p>
            <p>Demanda: {consumoMensal.outras.demanda.toLocaleString('pt-BR')} kW</p>
          </div>
        </div>
      </div>

      <div className="calc-selection">
        <h3>Selecione o Tipo de Cálculo</h3>
        <select 
          value={selectedCalc} 
          onChange={(e) => setSelectedCalc(e.target.value)}
        >
          <option value="">Selecione...</option>
          {CALCULO_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="calc-inputs">
        <div className="input-group">
          <label>Consumo (kWh)</label>
          <input
            type="number"
            value={consumo}
            onChange={(e) => setConsumo(parseFloat(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label>Tarifa (R$)</label>
          <input
            type="number"
            step="0.01"
            value={tarifa}
            onChange={(e) => setTarifa(parseFloat(e.target.value))}
          />
        </div>

        {(selectedCalc.includes('Demanda') || selectedCalc.includes('Ultrapassagem')) && (
          <>
            <div className="input-group">
              <label>Demanda Contratada (kW)</label>
              <input
                type="number"
                value={demandaContratada}
                onChange={(e) => setDemandaContratada(parseFloat(e.target.value))}
              />
            </div>
            {selectedCalc.includes('Ultrapassagem') && (
              <div className="input-group">
                <label>Demanda Medida (kW)</label>
                <input
                  type="number"
                  value={demandaMedida}
                  onChange={(e) => setDemandaMedida(parseFloat(e.target.value))}
                />
              </div>
            )}
          </>
        )}

        <div className="impostos-group">
          <h4>Impostos (%)</h4>
          <div className="impostos-inputs">
            <div className="input-group">
              <label>PIS</label>
              <input
                type="number"
                step="0.01"
                value={impostos.pis}
                onChange={(e) => setImpostos({...impostos, pis: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>COFINS</label>
              <input
                type="number"
                step="0.01"
                value={impostos.cofins}
                onChange={(e) => setImpostos({...impostos, cofins: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>ICMS</label>
              <input
                type="number"
                step="0.01"
                value={impostos.icms}
                onChange={(e) => setImpostos({...impostos, icms: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="button-group">
          <button 
            className="calculate-btn"
            onClick={calculateTariffs}
            disabled={!selectedCalc || !consumo || !tarifa}
          >
            <FaCalculator /> Calcular
          </button>

          {results && (
            <button 
              className="export-btn"
              onClick={exportToExcel}
            >
              <FaDownload /> Exportar para Excel
            </button>
          )}
        </div>
      </div>

      {results && (
        <div className="results-container">
          <h3>Resultados</h3>
          <div className="results-grid">
            <div className="result-item">
              <label>Tarifa com Desconto (15%)</label>
              <span>{results.tarifaDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="result-item">
              <label>Resultado do Cálculo</label>
              <span>{results.resultado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="result-item">
              <label>PIS</label>
              <span>{results.impostos.pis.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="result-item">
              <label>COFINS</label>
              <span>{results.impostos.cofins.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="result-item">
              <label>ICMS</label>
              <span>{results.impostos.icms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="result-item total">
              <label>Total com Impostos</label>
              <span>{results.tarifaComImpostos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
        </div>
      )}

      {selectedUnit && historicalData.length > 0 && (
        <div className="historical-data">
          <h3>Histórico da Unidade</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mês/Ano</th>
                  <th>Consumo (kWh)</th>
                  <th>Demanda (kW)</th>
                  <th>Valor (R$)</th>
                  <th>Valor/kWh (R$)</th>
                </tr>
              </thead>
              <tbody>
                {historicalData.map(data => (
                  <tr key={`${data.month}-${data.year}`}>
                    <td>{data.month}/{data.year}</td>
                    <td>{data.consumption.toLocaleString('pt-BR')}</td>
                    <td>{data.demand.toLocaleString('pt-BR')}</td>
                    <td>{data.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>{(data.amount / data.consumption).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        .calculations-container {
          padding: 20px;
        }

        .unit-selection {
          margin-bottom: 30px;
        }

        .unit-selection select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .consumo-mensal {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .consumo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .consumo-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
        }

        .consumo-item h4 {
          margin-top: 0;
          color: #2c3e50;
        }

        .consumo-item p {
          margin: 5px 0;
          color: #7f8c8d;
        }

        .calc-selection {
          margin-bottom: 20px;
        }

        .calc-selection select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .calc-inputs {
          display: grid;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .input-group label {
          font-weight: 500;
        }

        .input-group input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .impostos-group {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
        }

        .impostos-inputs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .button-group {
          display: flex;
          gap: 10px;
        }

        .calculate-btn, .export-btn {
          padding: 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .calculate-btn {
          background: #3498db;
          color: white;
        }

        .export-btn {
          background: #27ae60;
          color: white;
        }

        .calculate-btn:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }

        .results-container {
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 15px;
        }

        .result-item {
          background: white;
          padding: 15px;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .result-item label {
          color: #7f8c8d;
          font-size: 14px;
        }

        .result-item span {
          font-weight: bold;
          color: #2c3e50;
          font-size: 18px;
        }

        .result-item.total {
          grid-column: 1 / -1;
          background: #3498db;
        }

        .result-item.total label,
        .result-item.total span {
          color: white;
        }

        .historical-data {
          margin-top: 30px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .table-container {
          overflow-x: auto;
          margin-top: 15px;
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

        td {
          color: #7f8c8d;
        }

        @media (max-width: 768px) {
          .consumo-grid {
            grid-template-columns: 1fr;
          }

          .impostos-inputs {
            grid-template-columns: 1fr;
          }

          .button-group {
            flex-direction: column;
          }

          .calculate-btn, .export-btn {
            width: 100%;
          }

          .results-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Calculations; 