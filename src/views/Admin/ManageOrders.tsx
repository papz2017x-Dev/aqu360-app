import React, { useState } from 'react';
import { useStore } from '../../store/Store';
import type { Order, OrderStatus } from '../../store/Store';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { List, Map as MapIcon, Truck, Store, MapPin, ChevronLeft, Banknote, CheckCircle } from 'lucide-react';

const getStatusMarker = (status: OrderStatus) => {
  let color = '#3B82F6';
  if (status === 'pending') color = '#EF4444';
  if (status === 'processing') color = '#3B82F6';
  if (status === 'out-for-delivery') color = '#F59E0B';
  if (status === 'delivered') color = '#10B981';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export const ManageOrders: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { orders, updateOrderStatus, products, resolveCancellation, markOrderAsPaid } = useStore();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showMapOrderId, setShowMapOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all_active'>('all_active');
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const statuses: OrderStatus[] = ['pending', 'processing', 'out-for-delivery', 'delivered', 'cancelled'];

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all_active') return order.status !== 'cancelled';
    return order.status === statusFilter;
  });

  return (
    <div className="animate-slide-up pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"><ChevronLeft size={20} /></button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Manage Orders</h2>
          <p className="text-xs text-muted font-bold uppercase tracking-wider">{pendingCount} Pending Requests</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <select 
          className="input" 
          style={{ width: 'auto', padding: '0.5rem 1rem', height: 'auto', fontSize: '0.8rem', fontWeight: 800, borderRadius: '12px', background: '#F3F4F6', border: 'none', cursor: 'pointer' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all_active">All Active</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="out-for-delivery">Out for Delivery / Ready for Pickup</option>
          <option value="delivered">Delivered / Picked Up</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}><List size={20} /></button>
          <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}><MapIcon size={20} /></button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="flex flex-col gap-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted">No orders found for the selected filter.</div>
          ) : (
            filteredOrders.map((order: Order) => (
            <div 
              key={order.id} 
              className="product-card" 
              style={{ 
                padding: '1.5rem', 
                cursor: 'pointer',
                background: 'white',
                border: showMapOrderId === order.id ? '2px solid var(--color-primary)' : '1px solid #F3F4F6',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                borderRadius: '24px'
              }}
              onClick={() => {
                if (!order.isPaid) {
                  setPaymentModalOrder(order);
                } else {
                  setShowMapOrderId(showMapOrderId === order.id ? null : order.id);
                }
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.125rem', color: '#111827', marginBottom: '4px' }}>{order.customerName}</div>
                  <div className="flex items-center gap-2">
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', 
                      background: order.orderType === 'delivery' ? '#EFF6FF' : '#F5F3FF', 
                      color: order.orderType === 'delivery' ? '#1D4ED8' : '#6D28D9', 
                      borderRadius: '20px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase'
                    }}>
                      {order.orderType === 'delivery' ? <Truck size={12} /> : <Store size={12} />}
                      {order.orderType}
                    </div>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', 
                      background: '#F0FDF4', 
                      color: '#15803D', 
                      borderRadius: '20px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase'
                    }}>
                      <Banknote size={12} />
                      {order.paymentMethod?.replace('-', ' ') || 'COD'}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--color-primary)' }}>₱{order.totalAmount.toFixed(0)}</div>
              </div>

              <div className="flex items-start gap-2 mb-4">
                <MapPin size={16} className="text-gray-400 mt-0.5" />
                <p style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: 500 }}>{order.address}</p>
              </div>

              {showMapOrderId === order.id && order.location && order.orderType !== 'pickup' && (
                <div className="animate-slide-up" style={{ height: '220px', width: '100%', marginBottom: '1.25rem', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                  <MapContainer center={[order.location.lat, order.location.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[order.location.lat, order.location.lng]} icon={getStatusMarker(order.status)} />
                  </MapContainer>
                </div>
              )}

              <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px' }}>Order Items</div>
                {order.items.map((item, idx) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={idx} className="flex justify-between items-center text-sm mb-1">
                      <span style={{ fontWeight: 700, color: '#374151' }}>{item.quantity}x <span style={{ fontWeight: 500 }}>{product?.name || 'Product'}</span></span>
                      <span style={{ fontWeight: 700 }}>₱{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF' }}>#{order.id.substring(0, 8).toUpperCase()}</span>
                <div className="flex items-center gap-3">
                  {order.isPaid ? (
                    <div style={{ 
                      fontSize: '0.75rem', fontWeight: 800, color: '#10B981', 
                      background: '#D1FAE5', padding: '0.5rem 1rem', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <CheckCircle size={14} /> PAID
                    </div>
                  ) : null}
                  <select 
                    className="input" 
                    style={{ width: 'auto', padding: '0.5rem 1rem', height: 'auto', fontSize: '0.8rem', fontWeight: 800, borderRadius: '12px', background: '#F3F4F6', border: 'none' }} 
                    value={order.status} 
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { 
                      e.stopPropagation(); 
                      const newStatus = e.target.value as OrderStatus;
                      console.log('Status change detected:', newStatus);
                      
                      // Trigger modal immediately if marking as final status
                      if (newStatus === 'delivered' && !order.isPaid) {
                        setPaymentModalOrder(order);
                      }
                      
                      updateOrderStatus(order.id, newStatus); 
                    }}
                  >
                    {statuses.map(s => {
                      let label = s.replace('-', ' ').toUpperCase();
                      if (order.orderType === 'pickup') {
                        if (s === 'out-for-delivery') label = 'READY FOR PICKUP';
                        if (s === 'delivered') label = 'PICKED UP';
                      }
                      return <option key={s} value={s}>{label}</option>;
                    })}
                  </select>
                </div>
              </div>

              {order.cancellation && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '16px' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ background: '#EF4444', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Cancellation Requested</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7F1D1D' }}>{order.cancellation.reason}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="btn" 
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem', background: 'white', color: '#EF4444', border: '1px solid #FCA5A5' }}
                      onClick={() => resolveCancellation(order.id, true)}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn" 
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem', background: '#FCA5A5', color: '#7F1D1D' }}
                      onClick={() => resolveCancellation(order.id, false)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
          )}
        </div>
      ) : (
        <div className="product-card" style={{ padding: 0, overflow: 'hidden', height: '500px', borderRadius: '32px' }}>
          <MapContainer center={[14.5995, 120.9842]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredOrders.map(order => order.location && (
              <Marker key={order.id} position={[order.location.lat, order.location.lng]} icon={getStatusMarker(order.status)}>
                <Popup>
                  <strong>{order.customerName}</strong>
                  <p>{order.address}</p>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${order.location.lat},${order.location.lng}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '8px', marginTop: '8px', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>Get Directions</a>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
      {/* Payment Modal */}
      {paymentModalOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="animate-slide-up" style={{ background: 'white', borderRadius: '32px', padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Record Payment</h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Select how the customer paid for this order.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <button 
                className="btn" 
                style={{ background: '#F3F4F6', padding: '1rem', borderRadius: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => { markOrderAsPaid(paymentModalOrder.id, 'cod'); setPaymentModalOrder(null); }}
              >
                <Banknote size={24} className="text-primary" /> Cash on Delivery
              </button>
              <button 
                className="btn" 
                style={{ background: '#F3F4F6', padding: '1rem', borderRadius: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => { markOrderAsPaid(paymentModalOrder.id, 'gcash'); setPaymentModalOrder(null); }}
              >
                <div style={{ background: '#0055FF', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem' }}>GCash</div> Digital Payment
              </button>
              <button 
                className="btn" 
                style={{ background: '#F3F4F6', padding: '1rem', borderRadius: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => { markOrderAsPaid(paymentModalOrder.id, 'on-pickup'); setPaymentModalOrder(null); }}
              >
                <Store size={24} className="text-primary" /> Paid on Pickup
              </button>
            </div>
            
            <button 
              className="btn w-full" 
              style={{ color: '#9CA3AF', fontWeight: 700 }}
              onClick={() => setPaymentModalOrder(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
