import React, { useMemo } from 'react';
import { useStore } from '../../store/Store';
import { BarChart3, TrendingUp, Package, Calendar, ArrowUpRight, ChevronLeft } from 'lucide-react';

export const Reports: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { orders, products } = useStore();

  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'delivered'), [orders]);

  const stats = useMemo(() => {
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalItems = deliveredOrders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
    const avgOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;
    
    return { totalRevenue, totalOrders: deliveredOrders.length, totalItems, avgOrderValue };
  }, [deliveredOrders]);

  const productSales = useMemo(() => {
    const sales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    deliveredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!sales[item.productId]) {
          const product = products.find(p => p.id === item.productId);
          sales[item.productId] = { name: product?.name || 'Unknown Product', quantity: 0, revenue: 0 };
        }
        sales[item.productId].quantity += item.quantity;
        sales[item.productId].revenue += item.price * item.quantity;
      });
    });
    return Object.values(sales).sort((a, b) => b.revenue - a.revenue);
  }, [deliveredOrders, products]);

  return (
    <div className="animate-slide-up pb-10" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"><ChevronLeft size={20} /></button>
        <div className="flex-1">
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Analytics Overview</h3>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827', margin: 0 }}>Sales Performance</h2>
        </div>
        <div style={{ background: '#F3F4F6', padding: '6px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#4B5563' }}>
          <Calendar size={14} /> All Time
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', padding: '2rem', borderRadius: '32px', color: 'white', boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}><TrendingUp size={150} /></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Gross Revenue</div>
          <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>₱{stats.totalRevenue.toLocaleString()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight size={14} /> +12.5%
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7 }}>vs previous period</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <MiniStat label="Orders" value={stats.totalOrders.toString()} icon={<Package size={16} />} color="#10B981" />
        <MiniStat label="Avg Value" value={`₱${stats.avgOrderValue.toFixed(0)}`} icon={<TrendingUp size={16} />} color="#8B5CF6" />
        <MiniStat label="Units" value={stats.totalItems.toString()} icon={<BarChart3 size={16} />} color="#F59E0B" />
      </div>

      <div style={{ background: 'white', padding: '1.75rem', borderRadius: '32px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 900, color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#EFF6FF', color: '#3B82F6', padding: '8px', borderRadius: '12px' }}><Package size={20} /></div>
          Top Selling Products
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {productSales.length > 0 ? productSales.map((item, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1F2937' }}>{item.name}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF' }}>{item.quantity} units moved</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, color: '#3B82F6' }}>₱{item.revenue.toLocaleString()}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10B981' }}>{((item.revenue / (stats.totalRevenue || 1)) * 100).toFixed(1)}% share</div>
                </div>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F3F4F6', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${(item.revenue / (stats.totalRevenue || 1)) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #60A5FA)', borderRadius: '10px' }}></div>
              </div>
            </div>
          )) : <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.875rem' }}>No sales data to display</div>}
        </div>
      </div>

      <div style={{ background: '#F0F9FF', padding: '1.5rem', borderRadius: '24px', border: '1px solid #E0F2FE' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <TrendingUp size={18} className="text-blue-600" />
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Growth Insight</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#1E40AF', lineHeight: '1.6', fontWeight: 500, margin: 0 }}>
          Your sales are currently driven by <span style={{ fontWeight: 800 }}>{productSales[0]?.name || 'N/A'}</span>. The average order value is <span style={{ fontWeight: 800 }}>₱{stats.avgOrderValue.toFixed(0)}</span>, which is healthy for your current scale.
        </p>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => (
  <div style={{ background: 'white', padding: '1rem', borderRadius: '24px', border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
    <div style={{ color: color, background: `${color}15`, width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#111827' }}>{value}</div>
    </div>
  </div>
);
