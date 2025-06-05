import React, { useState, useEffect } from 'react';
import { FaFilter, FaDownload, FaSearch, FaSave, FaEdit, FaCalculator } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const Control = () => {
  const [bills, setBills] = useState([]);
  const [filters, setFilters] = useState({
    unit: '',
    type: '',
    month: '',
    year: '',
    status: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [empenhoValue, setEmpenhoValue] = useState('');
  const [monthlyControl, setMonthlyControl] = useState([]);
  const [edpData, setEdpData] = useState(() => {
    const savedData = localStorage.getItem('edpControlData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    
    // Inicializa 12 meses com dados vazios
    const initialData = {};
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    months.forEach(month => {
      initialData[month] = {
        mes: month,
        vencimento: '',
        modoPagamento: '',
        numeroFatura: '',
        valorEstimado: ''
      };
    });
    
    return initialData;
  });

  const [editingMonth, setEditingMonth] = useState(null);
  const [totals, setTotals] = useState({
    totalEstimado: 0,
    totalPago: 0
  });

  useEffect(() => {
    fetchUnits();
    fetchBills();
    fetchMonthlyControl();
    localStorage.setItem('edpControlData', JSON.stringify(edpData));
    calculateTotals();
  }, [edpData]);

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units');
      const data = await response.json();
      setUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.unit) queryParams.append('unit', filters.unit);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.month) queryParams.append('month', filters.month);
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateRange.start) queryParams.append('startDate', filters.dateRange.start);
      if (filters.dateRange.end) queryParams.append('endDate', filters.dateRange.end);

      const response = await fetch(`/api/bills?${queryParams}`);
      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyControl = async () => {
    try {
      const response = await fetch('/api/control/monthly');
      const data = await response.json();
      setMonthlyControl(data);
    } catch (error) {
      console.error('Error fetching monthly control:', error);
    }
  };

  const handleEmpenhoSubmit = async () => {
    try {
      await fetch('/api/control/empenho', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ valor: parseFloat(empenhoValue) })
      });
      fetchMonthlyControl();
    } catch (error) {
      console.error('Error updating empenho:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    fetchBills();
  };

  const exportToExcel = () => {
    const data = Object.entries(edpData).map(([mes, dados]) => ({
      Mês: mes,
      Vencimento: dados.vencimento,
      'Modo de Pagamento': dados.modoPagamento,
      'Número da Fatura': dados.numeroFatura,
      'Valor Estimado': dados.valorEstimado
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Controle EDP");
    XLSX.writeFile(wb, "controle_edp.xlsx");
  };

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  const handleEdit = (month) => {
    setEditingMonth(month);
  };

  const handleSave = (month) => {
    setEditingMonth(null);
  };

  const handleChange = (month, field, value) => {
    setEdpData(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [field]: value
      }
    }));
  };

  const calculateTotals = () => {
    const total = Object.values(edpData).reduce((acc, month) => {
      const valorEstimado = parseFloat(month.valorEstimado) || 0;
      return acc + valorEstimado;
    }, 0);

    setTotals({
      totalEstimado: total
    });
  };

  return (
    <div className="control-container">
      <div className="filters-section">
        <h3>Filtros</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Unidade</label>
            <select
              value={filters.unit}
              onChange={(e) => handleFilterChange('unit', e.target.value)}
            >
              <option value="">Todas</option>
              {units.map(unit => (
                <option key={unit._id} value={unit._id}>
                  {unit.location} - Instalação: {unit.installationNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="agua">Água</option>
              <option value="esgoto">Esgoto</option>
              <option value="outras">Outras Áreas</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Mês</label>
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
            >
              <option value="">Todos</option>
              {months.map((month, index) => (
                <option key={index} value={month.toLowerCase()}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Ano</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
            >
              <option value="">Todos</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="processed">Processado</option>
              <option value="error">Erro</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Data Inicial</label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>Data Final</label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
            />
          </div>
        </div>

        <div className="filters-actions">
          <button onClick={applyFilters} className="apply-btn">
            <FaFilter /> Aplicar Filtros
          </button>
        </div>
      </div>

      <div className="empenho-section">
        <h3>Controle de Empenho</h3>
        <div className="empenho-input">
          <input
            type="number"
            placeholder="Valor do Empenho"
            value={empenhoValue}
            onChange={(e) => setEmpenhoValue(e.target.value)}
          />
          <button onClick={handleEmpenhoSubmit}>
            <FaSave /> Salvar
          </button>
        </div>
      </div>

      <div className="bills-section">
        <h3>Contas Processadas</h3>
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : bills.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Unidade</th>
                  <th>Instalação</th>
                  <th>Tipo</th>
                  <th>Mês/Ano</th>
                  <th>Consumo (kWh)</th>
                  <th>Demanda (kW)</th>
                  <th>Valor (R$)</th>
                  <th>Data de Leitura</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill._id}>
                    <td>{bill.unit.location}</td>
                    <td>{bill.unit.installationNumber}</td>
                    <td>
                      {bill.type === 'agua' ? 'Água' :
                       bill.type === 'esgoto' ? 'Esgoto' : 'Outras'}
                    </td>
                    <td>{bill.month}/{bill.year}</td>
                    <td>{bill.consumption.toLocaleString('pt-BR')}</td>
                    <td>{bill.demand.toLocaleString('pt-BR')}</td>
                    <td>{bill.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>{new Date(bill.readingDate).toLocaleDateString()}</td>
                    <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status status-${bill.status}`}>
                        {bill.status === 'pending' ? 'Pendente' :
                         bill.status === 'processed' ? 'Processado' : 'Erro'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            Nenhuma conta encontrada com os filtros selecionados.
          </div>
        )}
      </div>

      <div className="edp-section">
        <div className="header">
          <h2>Controle EDP</h2>
          <div className="actions">
            <button onClick={exportToExcel} className="export-btn">
              <FaDownload /> Exportar para Excel
            </button>
          </div>
        </div>

        <div className="totals-section">
          <div className="total-card">
            <div className="total-header">
              <FaCalculator />
              <h3>Total Estimado</h3>
            </div>
            <div className="total-value">
              {totals.totalEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>

        <div className="months-grid">
          {Object.entries(edpData).map(([month, data]) => (
            <div key={month} className="month-card">
              <div className="month-header">
                <h3>{month}</h3>
                {editingMonth === month ? (
                  <FaSave className="icon" onClick={() => handleSave(month)} />
                ) : (
                  <FaEdit className="icon" onClick={() => handleEdit(month)} />
                )}
              </div>

              <div className="month-content">
                <div className="input-group">
                  <label>Vencimento:</label>
                  <input
                    type="date"
                    value={data.vencimento}
                    onChange={(e) => handleChange(month, 'vencimento', e.target.value)}
                    disabled={editingMonth !== month}
                  />
                </div>

                <div className="input-group">
                  <label>Modo de Pagamento:</label>
                  <select
                    value={data.modoPagamento}
                    onChange={(e) => handleChange(month, 'modoPagamento', e.target.value)}
                    disabled={editingMonth !== month}
                  >
                    <option value="">Selecione...</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                    <option value="boleto">Boleto</option>
                    <option value="pix">PIX</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Número da Fatura:</label>
                  <input
                    type="text"
                    value={data.numeroFatura}
                    onChange={(e) => handleChange(month, 'numeroFatura', e.target.value)}
                    disabled={editingMonth !== month}
                  />
                </div>

                <div className="input-group">
                  <label>Valor Estimado:</label>
                  <input
                    type="number"
                    value={data.valorEstimado}
                    onChange={(e) => handleChange(month, 'valorEstimado', e.target.value)}
                    disabled={editingMonth !== month}
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .control-container {
          padding: 20px;
        }

        .filters-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .filter-group label {
          font-weight: 500;
          color: #2c3e50;
        }

        .filter-group select,
        .filter-group input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 100%;
        }

        .filters-actions {
          display: flex;
          gap: 10px;
        }

        .apply-btn,
        .export-btn {
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .apply-btn {
          background: #3498db;
          color: white;
        }

        .export-btn {
          background: #27ae60;
          color: white;
        }

        .empenho-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .empenho-input {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .empenho-input input {
          flex: 1;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .empenho-input button {
          padding: 8px 15px;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .bills-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .loading {
          text-align: center;
          padding: 20px;
          color: #7f8c8d;
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

        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-pending { background: #f39c12; color: white; }
        .status-processed { background: #27ae60; color: white; }
        .status-error { background: #e74c3c; color: white; }

        .no-data {
          text-align: center;
          padding: 20px;
          color: #7f8c8d;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .edp-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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

        .actions {
          display: flex;
          gap: 10px;
        }

        .totals-section {
          margin-bottom: 30px;
        }

        .total-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .total-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          color: #2c3e50;
        }

        .total-header h3 {
          margin: 0;
        }

        .total-value {
          font-size: 24px;
          font-weight: 600;
          color: #27ae60;
        }

        .months-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .month-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .month-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }

        .month-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .icon {
          cursor: pointer;
          color: #3498db;
          font-size: 1.2em;
        }

        .icon:hover {
          color: #2980b9;
        }

        .month-content {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .input-group label {
          font-size: 0.9em;
          color: #666;
        }

        .input-group input,
        .input-group select {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1em;
        }

        .input-group input:disabled,
        .input-group select:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .actions {
            justify-content: center;
          }

          .months-grid {
            grid-template-columns: 1fr;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .filters-actions {
            flex-direction: column;
          }

          .apply-btn,
          .export-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Control; 