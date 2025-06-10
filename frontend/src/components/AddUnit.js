import React, { useState } from 'react';
import { FaSave, FaWater, FaToilet, FaBuilding } from 'react-icons/fa';

const API_URL = 'https://pdf-processor-backend-novo.onrender.com/api';

const AddUnit = ({ onUnitAdded }) => {
  const [newUnit, setNewUnit] = useState({
    installationNumber: '',
    addressSAAE: '',
    addressEDP: '',
    station: '',
    meter: '',
    class: '',
    mapLink: '',
    status: 'ativo',
    bandeira: 'verde',
    type: 'agua'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUnit),
      });
      if (response.ok) {
        const data = await response.json();
        onUnitAdded(data);
        setNewUnit({
          installationNumber: '',
          addressSAAE: '',
          addressEDP: '',
          station: '',
          meter: '',
          class: '',
          mapLink: '',
          status: 'ativo',
          bandeira: 'verde',
          type: 'agua'
        });
        alert('Unidade adicionada com sucesso!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar unidade');
      }
    } catch (error) {
      console.error('Erro ao adicionar unidade:', error);
      alert(error.message || 'Erro ao adicionar unidade. Por favor, tente novamente.');
    }
  };

  return (
    <div className="add-unit-container">
      <h2>Nova Unidade</h2>
      <form onSubmit={handleSubmit}>
        <div className="type-selection">
          <h3>Selecione o Tipo</h3>
          <div className="type-buttons">
            <button 
              type="button"
              className={newUnit.type === 'agua' ? 'active' : ''} 
              onClick={() => setNewUnit({...newUnit, type: 'agua'})}
            >
              <FaWater /> Água
            </button>
            <button 
              type="button"
              className={newUnit.type === 'esgoto' ? 'active' : ''} 
              onClick={() => setNewUnit({...newUnit, type: 'esgoto'})}
            >
              <FaToilet /> Esgoto
            </button>
            <button 
              type="button"
              className={newUnit.type === 'outras' ? 'active' : ''} 
              onClick={() => setNewUnit({...newUnit, type: 'outras'})}
            >
              <FaBuilding /> Outras Áreas
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Instalação (Número):</label>
          <input
            type="text"
            value={newUnit.installationNumber}
            onChange={(e) => setNewUnit({ ...newUnit, installationNumber: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Endereço SAAE:</label>
          <textarea
            value={newUnit.addressSAAE}
            onChange={(e) => setNewUnit({ ...newUnit, addressSAAE: e.target.value })}
            rows={2}
            required
          />
        </div>
        <div className="form-group">
          <label>Endereço EDP:</label>
          <textarea
            value={newUnit.addressEDP}
            onChange={(e) => setNewUnit({ ...newUnit, addressEDP: e.target.value })}
            rows={2}
            required
          />
        </div>
        <div className="form-group">
          <label>Estação:</label>
          <input
            type="text"
            value={newUnit.station}
            onChange={(e) => setNewUnit({ ...newUnit, station: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Medidor:</label>
          <input
            type="text"
            value={newUnit.meter}
            onChange={(e) => setNewUnit({ ...newUnit, meter: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Classe:</label>
          <input
            type="text"
            value={newUnit.class}
            onChange={(e) => setNewUnit({ ...newUnit, class: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Mapa (link de localização):</label>
          <input
            type="text"
            value={newUnit.mapLink}
            onChange={(e) => setNewUnit({ ...newUnit, mapLink: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Bandeira:</label>
          <select
            value={newUnit.bandeira}
            onChange={(e) => setNewUnit({ ...newUnit, bandeira: e.target.value })}
            required
          >
            <option value="verde">Verde</option>
            <option value="amarela">Amarela</option>
            <option value="vermelha">Vermelha</option>
          </select>
        </div>
        <div className="form-group">
          <label>Status:</label>
          <select
            value={newUnit.status}
            onChange={(e) => setNewUnit({ ...newUnit, status: e.target.value })}
            required
          >
            <option value="ativo">ATIVO</option>
            <option value="inativo">INATIVO</option>
          </select>
        </div>
        <button type="submit">
          <FaSave /> Salvar Unidade
        </button>
      </form>

      <style jsx>{`
        .type-selection {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .type-selection h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .type-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .type-buttons button {
          flex: 1;
          min-width: 120px;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .type-buttons button:hover {
          border-color: #007bff;
          background: #f0f7ff;
        }

        .type-buttons button.active {
          border-color: #007bff;
          background: #007bff;
          color: white;
        }

        .type-buttons button svg {
          font-size: 1.2em;
        }

        @media (max-width: 768px) {
          .type-buttons {
            flex-direction: column;
          }
          
          .type-buttons button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AddUnit; 