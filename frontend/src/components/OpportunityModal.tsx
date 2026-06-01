"use client";

import React, { useState } from 'react';

export default function OpportunityModal({ 
  isOpen, 
  onClose, 
  onSave, 
  opportunity 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: any) => void;
  opportunity?: any;
}) {
  const [formData, setFormData] = useState(opportunity || {
    company_name: '',
    contact_name: '',
    contact_email: '',
    opportunity_name: '',
    description: '',
    estimated_value: 0,
    currency: 'USD',
    stage: 'Lead nuevo',
    priority: 'Media',
    probability: 50,
    owner: '',
    next_follow_up_date: new Date().toISOString().split('T')[0],
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {opportunity ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Empresa</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded-lg p-2"
              value={formData.company_name}
              onChange={e => setFormData({...formData, company_name: e.target.value})}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Oportunidad</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded-lg p-2"
              value={formData.opportunity_name}
              onChange={e => setFormData({...formData, opportunity_name: e.target.value})}
            />
          </div>
          
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Contacto Principal</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded-lg p-2"
              value={formData.contact_name}
              onChange={e => setFormData({...formData, contact_name: e.target.value})}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Email del Contacto</label>
            <input 
              type="email" 
              className="w-full border border-slate-300 rounded-lg p-2"
              value={formData.contact_email}
              onChange={e => setFormData({...formData, contact_email: e.target.value})}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Estimado (USD)</label>
            <input 
              type="number" 
              className="w-full border border-slate-300 rounded-lg p-2"
              value={formData.estimated_value}
              onChange={e => setFormData({...formData, estimated_value: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select 
              className="w-full border border-slate-300 rounded-lg p-2"
              value={formData.stage}
              onChange={e => setFormData({...formData, stage: e.target.value})}
            >
              <option>Lead nuevo</option>
              <option>Contactado</option>
              <option>Diagnóstico</option>
              <option>Propuesta enviada</option>
              <option>Negociación</option>
              <option>Ganado</option>
              <option>Perdido</option>
            </select>
          </div>
          
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
            <select 
              className="w-full border border-slate-300 rounded-lg p-2"
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value})}
            >
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
              <option>Crítica</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded-lg p-2"
              value={formData.owner}
              onChange={e => setFormData({...formData, owner: e.target.value})}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Próximo Seguimiento</label>
            <input 
              type="date" 
              className="w-full border border-slate-300 rounded-lg p-2"
              value={formData.next_follow_up_date}
              onChange={e => setFormData({...formData, next_follow_up_date: e.target.value})}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors font-medium"
          >
            Guardar Oportunidad
          </button>
        </div>
      </div>
    </div>
  );
}
