import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

const Occurrences = () => {
  const [occurrences, setOccurrences] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    unit: '',
    priority: 'normal',
    type: 'issue',
    status: 'open',
    assignedTo: '',
    dueDate: ''
  });
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    unit: '',
    assignedTo: ''
  });

  useEffect(() => {
    fetchOccurrences();
    fetchUnits();
    fetchUsers();
  }, []);

  const fetchOccurrences = async () => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/occurrences?${queryParams}`);
      const data = await response.json();
      setOccurrences(data);
    } catch (error) {
      console.error('Error fetching occurrences:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units');
      const data = await response.json();
      setUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `/api/occurrences/${editingId}`
        : '/api/occurrences';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({
          title: '',
          description: '',
          unit: '',
          priority: 'normal',
          type: 'issue',
          status: 'open',
          assignedTo: '',
          dueDate: ''
        });
        fetchOccurrences();
      }
    } catch (error) {
      console.error('Error saving occurrence:', error);
    }
  };

  const handleEdit = (occurrence) => {
    setFormData(occurrence);
    setEditingId(occurrence._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta ocorrência?')) {
      return;
    }

    try {
      const response = await fetch(`/api/occurrences/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchOccurrences();
      }
    } catch (error) {
      console.error('Error deleting occurrence:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/occurrences/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOccurrences();
      }
    } catch (error) {
      console.error('Error updating occurrence status:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="occurrences-container">
      <div className="header">
        <h2>Ocorrências</h2>
        <button 
          className="add-btn"
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              unit: '',
              priority: 'normal',
              type: 'issue',
              status: 'open',
              assignedTo: '',
              dueDate: ''
            });
            setShowForm(true);
          }}
        >
          <FaPlus /> Nova Ocorrência
        </button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="open">Em Aberto</option>
            <option value="in_progress">Em Andamento</option>
            <option value="resolved">Resolvido</option>
            <option value="closed">Fechado</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Prioridade</label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Tipo</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="issue">Problema</option>
            <option value="maintenance">Manutenção</option>
            <option value="improvement">Melhoria</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Unidade</label>
          <select
            value={filters.unit}
            onChange={(e) => handleFilterChange('unit', e.target.value)}
          >
            <option value="">Todas</option>
            {units.map(unit => (
              <option key={unit._id} value={unit._id}>
                {unit.location}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Responsável</label>
          <select
            value={filters.assignedTo}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
          >
            <option value="">Todos</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <button 
          className="apply-filters"
          onClick={fetchOccurrences}
        >
          Aplicar Filtros
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingId ? 'Editar Ocorrência' : 'Nova Ocorrência'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Unidade</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    required
                  >
                    <option value="">Selecione...</option>
                    {units.map(unit => (
                      <option key={unit._id} value={unit._id}>
                        {unit.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    required
                  >
                    <option value="low">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option value="issue">Problema</option>
                    <option value="maintenance">Manutenção</option>
                    <option value="improvement">Melhoria</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Responsável</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data Limite</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="open">Em Aberto</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="resolved">Resolvido</option>
                    <option value="closed">Fechado</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingId ? 'Atualizar' : 'Salvar'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="occurrences-list">
        {occurrences.map(occurrence => (
          <div key={occurrence._id} className={`occurrence-card priority-${occurrence.priority}`}>
            <div className="occurrence-header">
              <h3>{occurrence.title}</h3>
              <div className="occurrence-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(occurrence)}
                >
                  <FaEdit />
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(occurrence._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="occurrence-body">
              <p>{occurrence.description}</p>
              
              <div className="occurrence-details">
                <span className={`status status-${occurrence.status}`}>
                  {occurrence.status === 'open' ? 'Em Aberto' :
                   occurrence.status === 'in_progress' ? 'Em Andamento' :
                   occurrence.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                </span>
                <span className={`priority priority-${occurrence.priority}`}>
                  {occurrence.priority === 'low' ? 'Baixa' :
                   occurrence.priority === 'normal' ? 'Normal' :
                   occurrence.priority === 'high' ? 'Alta' : 'Urgente'}
                </span>
                <span className={`type type-${occurrence.type}`}>
                  {occurrence.type === 'issue' ? 'Problema' :
                   occurrence.type === 'maintenance' ? 'Manutenção' :
                   occurrence.type === 'improvement' ? 'Melhoria' : 'Outro'}
                </span>
              </div>

              <div className="occurrence-info">
                <div>
                  <strong>Unidade:</strong> {units.find(u => u._id === occurrence.unit)?.location}
                </div>
                {occurrence.assignedTo && (
                  <div>
                    <strong>Responsável:</strong> {users.find(u => u._id === occurrence.assignedTo)?.name}
                  </div>
                )}
                {occurrence.dueDate && (
                  <div>
                    <strong>Data Limite:</strong> {new Date(occurrence.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="status-actions">
                {occurrence.status !== 'closed' && (
                  <>
                    {occurrence.status === 'open' && (
                      <button 
                        onClick={() => handleStatusChange(occurrence._id, 'in_progress')}
                        className="status-btn start-btn"
                      >
                        Iniciar
                      </button>
                    )}
                    {occurrence.status === 'in_progress' && (
                      <button 
                        onClick={() => handleStatusChange(occurrence._id, 'resolved')}
                        className="status-btn resolve-btn"
                      >
                        Resolver
                      </button>
                    )}
                    {occurrence.status === 'resolved' && (
                      <button 
                        onClick={() => handleStatusChange(occurrence._id, 'closed')}
                        className="status-btn close-btn"
                      >
                        Fechar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .occurrences-container {
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .add-btn {
          background: #27ae60;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filters {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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

        .filter-group select {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .apply-filters {
          background: #3498db;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          grid-column: 1 / -1;
        }

        .form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .form-container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
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
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .form-group textarea {
          height: 100px;
          resize: vertical;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .save-btn,
        .cancel-btn {
          padding: 8px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .save-btn {
          background: #27ae60;
          color: white;
        }

        .cancel-btn {
          background: #e74c3c;
          color: white;
        }

        .occurrences-list {
          display: grid;
          gap: 20px;
        }

        .occurrence-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border-left: 4px solid transparent;
        }

        .occurrence-card.priority-urgent { border-color: #e74c3c; }
        .occurrence-card.priority-high { border-color: #f39c12; }
        .occurrence-card.priority-normal { border-color: #3498db; }
        .occurrence-card.priority-low { border-color: #27ae60; }

        .occurrence-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .occurrence-header h3 {
          margin: 0;
        }

        .occurrence-actions {
          display: flex;
          gap: 10px;
        }

        .edit-btn,
        .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
        }

        .edit-btn { color: #3498db; }
        .delete-btn { color: #e74c3c; }

        .occurrence-body p {
          margin: 0 0 15px 0;
          color: #7f8c8d;
        }

        .occurrence-details {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .status,
        .priority,
        .type {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-open { background: #f39c12; color: white; }
        .status-in_progress { background: #3498db; color: white; }
        .status-resolved { background: #27ae60; color: white; }
        .status-closed { background: #95a5a6; color: white; }

        .priority-urgent { background: #e74c3c; color: white; }
        .priority-high { background: #f39c12; color: white; }
        .priority-normal { background: #3498db; color: white; }
        .priority-low { background: #27ae60; color: white; }

        .type-issue { background: #e74c3c; color: white; }
        .type-maintenance { background: #f39c12; color: white; }
        .type-improvement { background: #3498db; color: white; }
        .type-other { background: #95a5a6; color: white; }

        .occurrence-info {
          margin-bottom: 15px;
          color: #7f8c8d;
        }

        .occurrence-info div {
          margin-bottom: 5px;
        }

        .status-actions {
          display: flex;
          gap: 10px;
        }

        .status-btn {
          padding: 8px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: white;
        }

        .start-btn { background: #3498db; }
        .resolve-btn { background: #27ae60; }
        .close-btn { background: #95a5a6; }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .occurrence-details {
            flex-wrap: wrap;
          }

          .status-actions {
            flex-direction: column;
          }

          .status-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Occurrences; 