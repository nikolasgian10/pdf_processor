import React, { useState, useEffect } from 'react';
import { FaDownload, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const [selectedUnit, setSelectedUnit] = useState('');
  const [units, setUnits] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units');
      const data = await response.json();
      setUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchReportData = async () => {
    if (!selectedUnit) return;

    try {
      const params = new URLSearchParams({
        start: dateRange.start,
        end: dateRange.end
      });

      const response = await fetch(`/api/reports/${selectedUnit}?${params}`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      alert('Erro ao buscar dados do relatório');
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;

    const monthlyData = reportData.monthlyData.map(data => ({
      'Mês/Ano': `${data.month}/${data.year}`,
      'Consumo (kWh)': data.consumption,
      'Demanda (kW)': data.demand,
      'Valor (R$)': data.amount,
      'Valor/kWh (R$)': data.amount / data.consumption
    }));

    const ws = XLSX.utils.json_to_sheet(monthlyData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, `relatorio_${selectedUnit}_${dateRange.start}_${dateRange.end}.xlsx`);
  };

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(`Relatório de Consumo - ${reportData.unitInfo.location}`, 14, 15);

    // Add unit info
    doc.setFontSize(12);
    doc.text(`Instalação: ${reportData.unitInfo.installationNumber}`, 14, 25);
    doc.text(`Medidor: ${reportData.unitInfo.meterNumber}`, 14, 32);
    doc.text(`Período: ${dateRange.start} a ${dateRange.end}`, 14, 39);

    // Add monthly data table
    doc.autoTable({
      head: [['Mês/Ano', 'Consumo (kWh)', 'Demanda (kW)', 'Valor (R$)', 'R$/kWh']],
      body: reportData.monthlyData.map(row => [
        `${row.month}/${row.year}`,
        row.consumption,
        row.demand,
        row.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        (row.amount / row.consumption).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      ]),
      startY: 45
    });

    // Add summary
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text('Resumo:', 14, finalY);
    doc.text(`Consumo Total: ${reportData.summary.totalConsumption.toLocaleString('pt-BR')} kWh`, 14, finalY + 7);
    doc.text(`Valor Total: ${reportData.summary.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, finalY + 14);
    doc.text(`Média Mensal: ${reportData.summary.averageConsumption.toLocaleString('pt-BR')} kWh`, 14, finalY + 21);

    doc.save(`relatorio_${selectedUnit}_${dateRange.start}_${dateRange.end}.pdf`);
  };

  return (
    <div className="reports-container">
      <div className="filters-section">
        <div className="unit-selection">
          <h3>Selecione a Unidade</h3>
          <select 
            value={selectedUnit} 
            onChange={(e) => setSelectedUnit(e.target.value)}
          >
            <option value="">Selecione...</option>
            {units.map(unit => (
              <option key={unit._id} value={unit.installationNumber}>
                {unit.location} - Instalação: {unit.installationNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="date-range">
          <div className="date-input">
            <label>Data Inicial:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          <div className="date-input">
            <label>Data Final:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
        </div>

        <button 
          className="fetch-btn"
          onClick={fetchReportData}
          disabled={!selectedUnit || !dateRange.start || !dateRange.end}
        >
          Buscar Dados
        </button>
      </div>

      {reportData && (
        <div className="report-content">
          <div className="report-header">
            <h3>Relatório de Consumo - {reportData.unitInfo.location}</h3>
            <div className="export-buttons">
              <button onClick={exportToExcel}>
                <FaFileExcel /> Excel
              </button>
              <button onClick={exportToPDF}>
                <FaFilePdf /> PDF
              </button>
            </div>
          </div>

          <div className="consumption-chart">
            <h4>Consumo x Custo Mensal</h4>
            <Line 
              data={{
                labels: reportData.monthlyData.map(d => `${d.month}/${d.year}`),
                datasets: [
                  {
                    label: 'Consumo (kWh)',
                    data: reportData.monthlyData.map(d => d.consumption),
                    borderColor: '#3498db',
                    yAxisID: 'y'
                  },
                  {
                    label: 'Custo (R$)',
                    data: reportData.monthlyData.map(d => d.amount),
                    borderColor: '#2ecc71',
                    yAxisID: 'y1'
                  }
                ]
              }}
              options={{
                responsive: true,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Consumo (kWh)'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Custo (R$)'
                    },
                    grid: {
                      drawOnChartArea: false
                    }
                  }
                }
              }}
            />
          </div>

          <div className="summary-section">
            <h4>Resumo do Período</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <label>Consumo Total</label>
                <span>{reportData.summary.totalConsumption.toLocaleString('pt-BR')} kWh</span>
              </div>
              <div className="summary-item">
                <label>Valor Total</label>
                <span>{reportData.summary.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="summary-item">
                <label>Média Mensal</label>
                <span>{reportData.summary.averageConsumption.toLocaleString('pt-BR')} kWh</span>
              </div>
              <div className="summary-item">
                <label>Custo Médio por kWh</label>
                <span>{(reportData.summary.totalAmount / reportData.summary.totalConsumption).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>
          </div>

          <div className="data-table">
            <h4>Dados Mensais</h4>
            <table>
              <thead>
                <tr>
                  <th>Mês/Ano</th>
                  <th>Consumo (kWh)</th>
                  <th>Demanda (kW)</th>
                  <th>Valor (R$)</th>
                  <th>R$/kWh</th>
                </tr>
              </thead>
              <tbody>
                {reportData.monthlyData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.month}/{row.year}</td>
                    <td>{row.consumption}</td>
                    <td>{row.demand}</td>
                    <td>{row.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>{(row.amount / row.consumption).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        .reports-container {
          padding: 20px;
        }

        .filters-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          display: grid;
          gap: 20px;
        }

        .unit-selection select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .date-range {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .date-input {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .date-input label {
          font-weight: 500;
        }

        .date-input input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .fetch-btn {
          padding: 10px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .fetch-btn:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }

        .report-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .export-buttons {
          display: flex;
          gap: 10px;
        }

        .export-buttons button {
          padding: 8px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .export-buttons button:first-child {
          background: #27ae60;
          color: white;
        }

        .export-buttons button:last-child {
          background: #e74c3c;
          color: white;
        }

        .consumption-chart {
          margin-bottom: 30px;
        }

        .summary-section {
          margin-bottom: 30px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .summary-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
        }

        .summary-item label {
          display: block;
          color: #7f8c8d;
          margin-bottom: 5px;
        }

        .summary-item span {
          font-size: 18px;
          font-weight: 500;
          color: #2c3e50;
        }

        .data-table {
          overflow-x: auto;
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
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .date-range {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .report-header {
            flex-direction: column;
            gap: 15px;
          }

          .export-buttons {
            width: 100%;
          }

          .export-buttons button {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports; 