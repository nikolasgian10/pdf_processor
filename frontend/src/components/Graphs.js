import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';

const Graphs = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const responses = await Promise.all([
        fetch('/api/stats/agua'),
        fetch('/api/stats/esgoto'),
        fetch('/api/stats/outras')
      ]);
      
      const [aguaData, esgotoData, outrasData] = await Promise.all(
        responses.map(r => r.json())
      );

      const processedData = {
        comparison: {
          labels: ['Água', 'Esgoto', 'Outras Áreas'],
          datasets: [
            {
              label: 'Consumo (kWh)',
              data: [
                aguaData.totalAgua.consumo,
                esgotoData.totalEsgoto.consumo,
                outrasData.totalOutras.consumo
              ],
              backgroundColor: 'rgba(46, 204, 113, 0.5)',
              borderColor: 'rgba(46, 204, 113, 1)',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              label: 'Custo (R$)',
              data: [
                aguaData.totalAgua.valor,
                esgotoData.totalEsgoto.valor,
                outrasData.totalOutras.valor
              ],
              backgroundColor: 'rgba(52, 152, 219, 0.5)',
              borderColor: 'rgba(52, 152, 219, 1)',
              borderWidth: 1,
              yAxisID: 'y1'
            }
          ]
        },
        evolution: {
          labels: aguaData.monthlyStats.map(m => m.mes),
          datasets: [
            {
              label: 'Consumo (kWh)',
              data: aguaData.monthlyStats.map(m => m.consumo),
              borderColor: 'rgba(46, 204, 113, 1)',
              backgroundColor: 'rgba(46, 204, 113, 0.1)',
              tension: 0.4,
              yAxisID: 'y',
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true
            },
            {
              label: 'Custo (R$)',
              data: aguaData.monthlyStats.map(m => m.valor),
              borderColor: 'rgba(52, 152, 219, 1)',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              tension: 0.4,
              yAxisID: 'y1',
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true
            }
          ]
        }
      };

      setData(processedData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const comparisonOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Comparação de Consumo e Custo por Área',
        font: {
          size: 16
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        title: {
          display: true,
          text: 'Áreas',
          color: '#666',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#666'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Consumo (kWh)',
          color: 'rgba(46, 204, 113, 1)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Custo (R$)',
          color: 'rgba(52, 152, 219, 1)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          color: '#666'
        }
      }
    }
  };

  const evolutionOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Evolução Mensal de Consumo e Custo',
        font: {
          size: 16
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        title: {
          display: true,
          text: 'Meses',
          color: '#666',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#666'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Consumo (kWh)',
          color: 'rgba(46, 204, 113, 1)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Custo (R$)',
          color: 'rgba(52, 152, 219, 1)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          color: '#666'
        }
      }
    }
  };

  return (
    <div className="graphs">
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Comparativo por Área</h3>
          {data && (
            <Bar data={data.comparison} options={comparisonOptions} />
          )}
        </div>

        <div className="chart-card">
          <h3>Evolução Mensal</h3>
          {data && (
            <Line data={data.evolution} options={evolutionOptions} />
          )}
        </div>
      </div>

      <style jsx>{`
        .graphs {
          padding: 20px;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .chart-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #2c3e50;
          text-align: center;
        }

        @media (max-width: 1024px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Graphs; 