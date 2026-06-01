"use client";

import React, { useEffect, useState } from 'react';
import AIAssistantWidget from '@/components/AIAssistantWidget';
import OpportunityModal from '@/components/OpportunityModal';
import { api } from '@/lib/api';

interface Opportunity {
  id: string;
  company_name: string;
  opportunity_name: string;
  estimated_value: number;
  stage: string;
  priority: string;
  owner: string;
}

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtros
  const [filterStage, setFilterStage] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchOpportunities();
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await api.post('/auth/login', { username, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.error || 'Error de conexión');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await api.get('/opportunities');
      if (Array.isArray(data)) setOpportunities(data);
    } catch (error) {
      console.error('Failed to fetch', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await api.post('/opportunities', data);
      setIsModalOpen(false);
      fetchOpportunities();
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const deleteOpportunity = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta oportunidad?')) return;
    try {
      await api.delete(`/opportunities/${id}`);
      fetchOpportunities();
    } catch (e) {
      console.error(e);
    }
  };

  const exportToCSV = () => {
    const headers = ['Oportunidad', 'Empresa', 'Valor', 'Etapa', 'Prioridad', 'Responsable'];
    const rows = filteredOpportunities.map(opp => [
      opp.opportunity_name,
      opp.company_name,
      opp.estimated_value,
      opp.stage,
      opp.priority,
      opp.owner
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "oportunidades.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">APIUX CRM - Login</h2>
          <input type="text" placeholder="Usuario" className="w-full border p-2 mb-4 rounded" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Contraseña" className="w-full border p-2 mb-6 rounded" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700">Ingresar</button>
        </form>
      </div>
    );
  }

  // Filtrado
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesStage = filterStage ? opp.stage === filterStage : true;
    const matchesPriority = filterPriority ? opp.priority === filterPriority : true;
    const matchesSearch = searchTerm ? 
      opp.opportunity_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      opp.company_name.toLowerCase().includes(searchTerm.toLowerCase()) 
      : true;
    return matchesStage && matchesPriority && matchesSearch;
  });

  // Métricas
  const totalValue = filteredOpportunities.reduce((acc, curr) => acc + curr.estimated_value, 0);
  const totalCount = filteredOpportunities.length;

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Crítica': return 'bg-red-100 text-red-800 border-red-200';
      case 'Alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            APIUX CRM LABS
          </h1>
          <div className="flex space-x-3">
            <button onClick={handleLogout} className="text-sm font-medium text-slate-600 hover:text-slate-800">Cerrar Sesión</button>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition-all font-medium text-sm flex items-center space-x-2">
              <span>+ Nueva Oportunidad</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Dashboard */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Oportunidades Visibles</p>
            <p className="text-3xl font-bold text-slate-800">{totalCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Valor Total Estimado</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalValue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div className="flex gap-3 flex-1">
            <input type="text" placeholder="Buscar por cliente o proyecto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-xs" />
            <select value={filterStage} onChange={e => setFilterStage(e.target.value)} className="bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas las Etapas</option>
              <option value="Lead nuevo">Lead nuevo</option>
              <option value="Negociación">Negociación</option>
              <option value="Ganado">Ganado</option>
              <option value="Perdido">Perdido</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas las Prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
          <button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
            Exportar CSV
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Oportunidad</th>
                    <th className="px-6 py-4 font-medium">Cliente</th>
                    <th className="px-6 py-4 font-medium">Valor Estimado</th>
                    <th className="px-6 py-4 font-medium">Estado</th>
                    <th className="px-6 py-4 font-medium">Prioridad</th>
                    <th className="px-6 py-4 font-medium">Responsable</th>
                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOpportunities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No hay oportunidades registradas aún.
                      </td>
                    </tr>
                  ) : (
                    filteredOpportunities.map(opp => (
                      <tr key={opp.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{opp.opportunity_name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{opp.company_name}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(opp.estimated_value)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{opp.stage}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(opp.priority)}`}>{opp.priority}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{opp.owner}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => deleteOpportunity(opp.id)} className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">Eliminar</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <AIAssistantWidget token={token} />
      <OpportunityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
    </div>
  );
}
