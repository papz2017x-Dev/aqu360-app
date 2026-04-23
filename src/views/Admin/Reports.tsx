import React, { useMemo } from 'react';
import { useStore } from '../../store/Store';
import { BarChart3, TrendingUp, Package, Calendar, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';

export const Reports: React.FC = () => {
  const { orders, products } = useStore();

  // Filter delivered orders for sales report
  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'delivered'), [orders]);

  // Statistics
  const stats = useMemo(() => {
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalItems = deliveredOrders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
    const avgOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;
    
    return {
      totalRevenue,
      totalOrders: deliveredOrders.length,
      totalItems,
      avgOrderValue
    };
  }, [deliveredOrders]);

  // Sales by Product
  const productSales = useMemo(() => {
    const sales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    deliveredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!sales[item.productId]) {
          const product = products.find(p => p.id === item.productId);
          sales[item.productId] = {
            name: product?.name || 'Unknown Product',
            quantity: 0,
            revenue: 0
          };
        }
        sales[item.productId].quantity += item.quantity;
        sales[item.productId].revenue += item.price * item.quantity;
      });
    });

    return Object.values(sales).sort((a, b) => b.revenue - a.revenue);
  }, [deliveredOrders, products]);

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Sales Performance</h3>
        <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary-light px-3 py-1.5 rounded-full">
          <Calendar size={14} /> All Time
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          label="Total Revenue" 
          value={`₱${stats.totalRevenue.toLocaleString()}`} 
          icon={<DollarSign size={20} />} 
          color="blue"
          trend="+12.5%"
          isUp={true}
        />
        <StatCard 
          label="Orders" 
          value={stats.totalOrders.toString()} 
          icon={<Package size={20} />} 
          color="green"
          trend="+5.2%"
          isUp={true}
        />
        <StatCard 
          label="Avg. Value" 
          value={`₱${stats.avgOrderValue.toFixed(0)}`} 
          icon={<TrendingUp size={20} />} 
          color="purple"
          trend="-2.1%"
          isUp={false}
        />
        <StatCard 
          label="Items Sold" 
          value={stats.totalItems.toString()} 
          icon={<BarChart3 size={20} />} 
          color="orange"
          trend="+8.4%"
          isUp={true}
        />
      </div>

      {/* Product Breakdown */}
      <div className="product-card p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
        <h4 className="font-black text-lg mb-6 flex items-center gap-2">
          <BarChart3 size={20} className="text-primary" /> Top Selling Products
        </h4>
        <div className="space-y-5">
          {productSales.length > 0 ? productSales.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <div>
                  <div className="font-bold text-gray-900">{item.name}</div>
                  <div className="text-xs text-muted font-medium">{item.quantity} units sold</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-primary">₱{item.revenue.toLocaleString()}</div>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${(item.revenue / stats.totalRevenue) * 100}%` }}
                ></div>
              </div>
            </div>
          )) : (
            <p className="text-center text-muted py-8 italic">No sales data available yet.</p>
          )}
        </div>
      </div>

      {/* Recent Activity Mini-List */}
      <div className="product-card p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
        <h4 className="font-black text-lg mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" /> Sales Insights
        </h4>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-sm text-blue-800 leading-relaxed font-medium">
            Your most profitable product is <span className="font-bold">"{productSales[0]?.name || 'N/A'}"</span>. 
            Delivered orders represent <span className="font-bold">{((deliveredOrders.length / (orders.length || 1)) * 100).toFixed(0)}%</span> of your total order volume.
          </p>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend: string;
  isUp: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, trend, isUp }) => {
  const colors = {
    blue: { bg: '#EFF6FF', text: '#1E40AF', icon: '#3B82F6' },
    green: { bg: '#F0FDF4', text: '#166534', icon: '#22C55E' },
    purple: { bg: '#F5F3FF', text: '#5B21B6', icon: '#8B5CF6' },
    orange: { bg: '#FFF7ED', text: '#9A3412', icon: '#F97316' }
  };

  const c = colors[color];

  return (
    <div className="product-card p-4 flex flex-col gap-3" style={{ background: 'white', borderRadius: '24px', border: '1px solid #F3F4F6' }}>
      <div className="flex justify-between items-start">
        <div style={{ background: c.bg, color: c.icon, padding: '0.6rem', borderRadius: '14px' }}>
          {icon}
        </div>
        <div className={`flex items-center text-[0.65rem] font-black px-1.5 py-0.5 rounded-full ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trend}
        </div>
      </div>
      <div>
        <div className="text-[0.65rem] font-bold text-muted uppercase tracking-widest mb-1">{label}</div>
        <div className="text-lg font-black text-gray-900">{value}</div>
      </div>
    </div>
  );
};
