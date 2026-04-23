import React, { useState } from 'react';
import { useStore } from '../../store/Store';
import { ChevronLeft, Save, Globe, Bell, Shield } from 'lucide-react';

export const ManageSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { deliveryFee, setGlobalDeliveryFee } = useStore();
  const [tempDeliveryFee, setTempDeliveryFee] = useState(deliveryFee.toString());

  const handleUpdateFee = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalDeliveryFee(Number(tempDeliveryFee));
    alert('Settings synchronized with cloud storage!');
  };

  return (
    <div className="animate-slide-up pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"><ChevronLeft size={20} /></button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>System Settings</h2>
      </div>

      <div className="flex flex-col gap-6">
        <div className="product-card p-8 bg-white" style={{ borderRadius: '32px' }}>
          <div className="flex items-center gap-4 mb-8">
            <div style={{ background: 'var(--color-primary-light)', padding: '0.75rem', borderRadius: '16px' }}>
              <Globe size={24} className="text-primary" />
            </div>
            <div>
              <div className="font-black text-lg text-gray-900">Delivery Configuration</div>
              <div className="text-xs text-muted font-bold uppercase tracking-widest">Global Parameters</div>
            </div>
          </div>
          
          <form onSubmit={handleUpdateFee} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest px-1">Standard Delivery Fee (₱)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">₱</span>
                <input 
                  type="number" 
                  className="input" 
                  style={{ paddingLeft: '2.5rem', fontSize: '1.1rem', fontWeight: 900 }}
                  value={tempDeliveryFee} 
                  onChange={e => setTempDeliveryFee(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full py-4 rounded-2xl shadow-lg shadow-blue-200">
              <Save size={20} /> <span style={{ fontWeight: 800 }}>Save Changes</span>
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="p-6 bg-white border border-gray-100 rounded-3xl flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
            <Bell size={24} className="text-gray-400" />
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Notifications</span>
          </button>
          <button className="p-6 bg-white border border-gray-100 rounded-3xl flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
            <Shield size={24} className="text-gray-400" />
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Security</span>
          </button>
        </div>
      </div>
    </div>
  );
};
