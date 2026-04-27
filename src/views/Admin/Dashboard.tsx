import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/Store';
import {
  LayoutDashboard, List, Store, BarChart3,
  ShieldCheck, Settings, Truck, TrendingUp
} from 'lucide-react';
import { ManageOrders } from './ManageOrders';
import { ManageStock } from './ManageStock';
import { ManageTeam } from './ManageTeam';
import { ManageSettings } from './ManageSettings';
import { Reports } from './Reports';

export const Dashboard: React.FC = () => {
  const { orders, currentUser } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState<'hub' | 'orders' | 'stock' | 'reports' | 'team' | 'settings'>('hub');

  useEffect(() => {
    const view = searchParams.get('view');
    if (view && ['hub', 'orders', 'stock', 'reports', 'team', 'settings'].includes(view)) {
      setActiveView(view as any);
    }
  }, [searchParams]);

  const handleBack = () => {
    setActiveView('hub');
    setSearchParams({});
  };

  const isSuperuser = currentUser?.role === 'superuser';
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0);

  if (activeView === 'orders') return <ManageOrders onBack={handleBack} />;
  if (activeView === 'stock') return <ManageStock onBack={handleBack} />;
  if (activeView === 'reports') return <Reports onBack={handleBack} />;
  if (activeView === 'team') return <ManageTeam onBack={handleBack} />;
  if (activeView === 'settings') return <ManageSettings onBack={handleBack} />;

  return (
    <div className="animate-slide-up pb-20">
      {/* Hero Hub Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-blue-200">
            <LayoutDashboard size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: 0 }}>Management</h1>
        </div>
        <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '0.9rem' }}>Welcome back, Admin. Here is your overview.</p>
      </div>

      {/* Quick Stats Banner */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 p-5 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-1">
          <div className="text-[0.65rem] font-bold text-muted uppercase tracking-widest">Pending Orders</div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#EF4444' }}>{pendingOrders}</span>
            <Truck size={18} className="text-red-400" />
          </div>
        </div>
        <div className="flex-1 p-5 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-1">
          <div className="text-[0.65rem] font-bold text-muted uppercase tracking-widest">Total Revenue</div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10B981' }}>₱{totalRevenue.toFixed(0)}</span>
            <TrendingUp size={18} className="text-green-400" />
          </div>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className="mx-4">
        <h3 className="text-[0.7rem] font-black text-muted uppercase tracking-[0.2em] px-2 mb-4">Service Modules</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <HubButton 
            onClick={() => setActiveView('orders')} 
            icon={<List size={24} />} 
            title="Orders & Logistics" 
            desc="Track deliveries and pickups"
            badge={pendingOrders > 0 ? `${pendingOrders} NEW` : undefined}
          />
          
          <HubButton 
            onClick={() => setActiveView('stock')} 
            icon={<Store size={24} />} 
            title="Stock Inventory" 
            desc="Manage products and pricing"
          />

          {isSuperuser && (
            <HubButton 
              onClick={() => setActiveView('reports')} 
              icon={<BarChart3 size={24} />} 
              title="Sales Analytics" 
              desc="Deep dive into revenue"
            />
          )}

          {isSuperuser && (
            <HubButton 
              onClick={() => setActiveView('team')} 
              icon={<ShieldCheck size={24} />} 
              title="Team & Access" 
              desc="Control staff permissions"
            />
          )}

          {isSuperuser && (
            <HubButton 
              onClick={() => setActiveView('settings')} 
              icon={<Settings size={24} />} 
              title="App Settings" 
              desc="Configure parameters"
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface HubButtonProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  badge?: string;
}

const HubButton = ({ icon, title, desc, onClick, badge }: HubButtonProps) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 transition-all duration-300 active:scale-95 bg-white shadow-sm"
    style={{ borderRadius: '24px', textAlign: 'center', minHeight: '180px', gap: '8px', border: '1px solid #F1F5F9', position: 'relative' }}
  >
    {badge && (
      <span style={{ 
        position: 'absolute',
        top: '12px',
        right: '12px',
        fontSize: '0.6rem', 
        fontWeight: 900, 
        background: '#EF4444', 
        color: 'white', 
        padding: '2px 8px', 
        borderRadius: '10px',
        letterSpacing: '0.05em',
        zIndex: 10
      }}>
        {badge}
      </span>
    )}
    <div style={{ 
      background: '#EFF6FF', 
      color: '#2563EB', 
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '12px'
    }}>
      {icon}
    </div>
    <div style={{ fontWeight: 900, fontSize: '0.85rem', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{title}</div>
    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, lineHeight: '1.4', maxWidth: '120px' }}>{desc}</div>
  </button>
);
