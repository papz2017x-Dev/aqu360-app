import React, { useState } from 'react';
import { useStore } from '../../store/Store';
import { 
  LayoutDashboard, List, Store, BarChart3, 
  ShieldCheck, Settings, Truck, Package, 
  ChevronRight, TrendingUp 
} from 'lucide-react';
import { ManageOrders } from './ManageOrders';
import { ManageStock } from './ManageStock';
import { ManageTeam } from './ManageTeam';
import { ManageSettings } from './ManageSettings';
import { Reports } from './Reports';

export const Dashboard: React.FC = () => {
  const { orders, currentUser } = useStore();
  const [activeView, setActiveView] = useState<'hub' | 'orders' | 'stock' | 'reports' | 'team' | 'settings'>('hub');

  const isSuperuser = currentUser?.role === 'superuser';
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0);

  if (activeView === 'orders') return <ManageOrders onBack={() => setActiveView('hub')} />;
  if (activeView === 'stock') return <ManageStock onBack={() => setActiveView('hub')} />;
  if (activeView === 'reports') return <Reports onBack={() => setActiveView('hub')} />;
  if (activeView === 'team') return <ManageTeam onBack={() => setActiveView('hub')} />;
  if (activeView === 'settings') return <ManageSettings onBack={() => setActiveView('hub')} />;

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
      <div className="flex flex-col gap-4">
        <h3 className="text-[0.7rem] font-black text-muted uppercase tracking-[0.2em] px-2 mb-1">Service Modules</h3>
        
        <HubButton 
          onClick={() => setActiveView('orders')} 
          icon={<List size={24} />} 
          title="Orders & Logistics" 
          desc="Track deliveries and pickups" 
          badge={pendingOrders > 0 ? `${pendingOrders} NEW` : undefined}
          color="#3B82F6"
        />
        
        <HubButton 
          onClick={() => setActiveView('stock')} 
          icon={<Store size={24} />} 
          title="Stock Inventory" 
          desc="Manage products and pricing" 
          color="#8B5CF6"
        />

        {isSuperuser && (
          <HubButton 
            onClick={() => setActiveView('reports')} 
            icon={<BarChart3 size={24} />} 
            title="Sales Analytics" 
            desc="Deep dive into your revenue" 
            color="#10B981"
          />
        )}

        {isSuperuser && (
          <HubButton 
            onClick={() => setActiveView('team')} 
            icon={<ShieldCheck size={24} />} 
            title="Team & Access" 
            desc="Control staff permissions" 
            color="#F59E0B"
          />
        )}

        {isSuperuser && (
          <HubButton 
            onClick={() => setActiveView('settings')} 
            icon={<Settings size={24} />} 
            title="App Settings" 
            desc="Configure global parameters" 
            color="#6B7280"
          />
        )}
      </div>

      {/* Quick Info Card */}
      <div className="mt-8 p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-center gap-4">
        <div style={{ background: 'white', padding: '12px', borderRadius: '16px', color: 'var(--color-primary)' }}>
          <Package size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, color: '#1E40AF', fontSize: '0.95rem' }}>Need help?</div>
          <p style={{ fontSize: '0.75rem', color: '#60A5FA', fontWeight: 600, margin: 0 }}>Check the documentation for advanced admin tools.</p>
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
  color: string;
  badge?: string;
}

const HubButton = ({ icon, title, desc, onClick, color, badge }: HubButtonProps) => (
  <button 
    onClick={onClick}
    className="product-card w-full p-5 flex items-center gap-5 transition-all duration-300 active:scale-95 bg-white border border-gray-100"
    style={{ borderRadius: '28px', textAlign: 'left' }}
  >
    <div style={{ 
      background: `${color}15`, 
      color: color, 
      padding: '12px', 
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
        <span style={{ fontWeight: 900, fontSize: '1rem', color: '#111827' }}>{title}</span>
        {badge && (
          <span style={{ 
            fontSize: '0.6rem', 
            fontWeight: 900, 
            background: '#EF4444', 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: '10px',
            letterSpacing: '0.05em'
          }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>{desc}</div>
    </div>
    <ChevronRight size={20} className="text-gray-300" />
  </button>
);
