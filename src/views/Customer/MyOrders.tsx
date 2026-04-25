import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/Store';
import type { Order, OrderItem } from '../../store/Store';
import { Clock, CheckCircle, Package, Truck, XCircle, Store, Trash2, RefreshCw, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const MyOrders: React.FC = () => {
  const { orders, currentUser, products, deleteOrder, requestCancellation } = useStore();
  const navigate = useNavigate();
  const [showMapId, setShowMapId] = useState<string | null>(null);

  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const cancellationReasons = [
    "Change of mind",
    "Incorrect quantity of order",
    "Delivery took too long",
    "Processing took too long"
  ];

  // Filter orders for the current user
  const myOrders = orders.filter(o => o.userId === currentUser?.id);

  const getStatusIcon = (status: Order['status']) => {
    try {
      switch (status) {
        case 'pending': return <Clock size={14} />;
        case 'processing': return <Package size={14} />;
        case 'out-for-delivery': return <Truck size={14} />;
        case 'delivered': return <CheckCircle size={14} />;
        case 'cancelled': return <XCircle size={14} />;
        default: return <Clock size={14} />;
      }
    } catch (e) {
      return <Clock size={14} />;
    }
  };



  const handleCancelOrder = (orderId: string) => {
    setCancelOrderId(orderId);
  };

  const submitCancellation = async () => {
    if (!cancelOrderId || !cancelReason) return;
    setIsSubmittingCancel(true);
    try {
      await requestCancellation(cancelOrderId, cancelReason);
      setCancelOrderId(null);
      setCancelReason('');
    } catch (e) {
      console.error(e);
      alert('Failed to submit cancellation request.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Permanently delete this order from history?')) {
      deleteOrder(orderId);
    }
  };

  const handleReorder = (order: Order) => {
    if (order.items.length > 0) {
      // For now, reorder the first item
      navigate(`/order?productId=${order.items[0].productId}`);
    }
  };

  const formatDateTime = (dateString: any) => {
    try {
      if (!dateString) return 'Just now';
      const date = (dateString.toDate && typeof dateString.toDate === 'function') 
        ? dateString.toDate() 
        : new Date(dateString);
      
      if (isNaN(date.getTime())) return 'Recently';

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' • ' +
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return 'Recently';
    }
  };

  const StatusStepper = ({ currentStatus, orderType }: { currentStatus: Order['status'], orderType: Order['orderType'] }) => {
    if (currentStatus === 'cancelled') return null;
    
    const stages: Order['status'][] = ['pending', 'processing', 'out-for-delivery', 'delivered'];
    const currentIndex = stages.indexOf(currentStatus);

    const getStageLabel = (status: Order['status']) => {
      if (orderType === 'pickup') {
        if (status === 'out-for-delivery') return 'Ready for Pickup';
        if (status === 'delivered') return 'Picked Up';
      }
      return status.replace('-', ' ');
    };

    const getStageIcon = (status: Order['status']) => {
      if (orderType === 'pickup') {
        if (status === 'out-for-delivery') return <Store size={14} />;
        if (status === 'delivered') return <CheckCircle size={14} />;
      }
      return getStatusIcon(status);
    };
    
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 0.5rem', position: 'relative' }}>
        {/* Background line */}
        <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: '#E5E7EB', zIndex: 0 }}></div>
        
        {/* Active progress line */}
        <div style={{ 
          position: 'absolute', top: '15px', left: '10%', 
          width: `${(currentIndex / (stages.length - 1)) * 80}%`, 
          height: '2px', background: 'var(--color-primary)', 
          transition: 'width 0.5s ease', zIndex: 1 
        }}></div>

        {stages.map((status, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          
          return (
            <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: isCurrent ? 'var(--color-primary)' : (isActive ? 'var(--color-primary-light)' : 'white'),
                border: isActive ? 'none' : '2px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isCurrent ? 'white' : (isActive ? 'var(--color-primary)' : '#9CA3AF'),
                transition: 'all 0.3s ease',
                boxShadow: isCurrent ? '0 0 0 4px rgba(37, 169, 226, 0.2)' : 'none'
              }}>
                {getStageIcon(status)}
              </div>
              <span style={{ 
                fontSize: '0.6rem', marginTop: '0.5rem', fontWeight: isActive ? 800 : 500, 
                color: isActive ? 'var(--color-text)' : '#9CA3AF',
                textAlign: 'center', maxWidth: '60px', textTransform: 'capitalize'
              }}>
                {getStageLabel(status)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ userSelect: 'none' }}>
      {cancelOrderId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div className="animate-slide-up" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: '#111827' }}>Cancel Order</h3>
            <p className="text-muted text-sm mb-4">Please select a reason for cancellation. An admin will review your request.</p>
            
            <div className="flex flex-col gap-3 mb-6">
              {cancellationReasons.map((reason, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', border: cancelReason === reason ? '2px solid var(--color-primary)' : '1px solid #E5E7EB', borderRadius: '12px', background: cancelReason === reason ? 'var(--color-primary-light)' : 'white' }}>
                  <input type="radio" name="cancelReason" value={reason} checked={cancelReason === reason} onChange={(e) => setCancelReason(e.target.value)} style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="btn" style={{ flex: 1, background: '#F3F4F6', color: '#4B5563', padding: '0.875rem', borderRadius: '12px', fontWeight: 700 }} onClick={() => { setCancelOrderId(null); setCancelReason(''); }}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '0.875rem', opacity: (!cancelReason || isSubmittingCancel) ? 0.6 : 1, borderRadius: '12px', fontWeight: 700 }} disabled={!cancelReason || isSubmittingCancel} onClick={submitCancellation}>
                {isSubmittingCancel ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="animate-slide-up">
        <div className="p-6 bg-white">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 15, color: '#111827' }}>My Orders</h2>
        </div>

      <div style={{ padding: '0 1.25rem 2rem' }}>
        {myOrders.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: '50vh',
            width: '100%'
          }}>
            <div style={{ background: 'var(--color-bg)', padding: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Clock size={48} className="text-muted" />
            </div>
            <p className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 500, margin: 0 }}>You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myOrders.map((order: Order) => (
              <div
                key={order.id}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '16px',
                  background: '#F3F4F6'
                }}
              >
                {/* Main Card Content */}
                <div
                  className="product-card"
                  onClick={() => setShowMapId(showMapId === order.id ? null : order.id)}
                  style={{
                    padding: '1.5rem',
                    background: 'white',
                    border: showMapId === order.id ? '2px solid var(--color-primary)' : '1px solid #E5E7EB',
                    boxShadow: showMapId === order.id ? 'var(--shadow-lg)' : 'none',
                    borderRadius: '16px',
                    position: 'relative',
                    zIndex: 2,
                    cursor: 'pointer',
                  }}
                >
                  {/* Header: Date and Status */}
                  <div className="flex justify-between items-center mb-6">
                    <div style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 500 }}>
                      {formatDateTime(order.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === 'cancelled' && (
                        <div
                          style={{
                            backgroundColor: '#FEE2E2',
                            color: '#EF4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.35rem 0.85rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          <XCircle size={14} />
                          <span>Cancelled</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stepper for non-cancelled orders */}
                  <StatusStepper currentStatus={order.status} orderType={order.orderType} />

                  {/* Body: Items List */}
                  <div className="mb-4">
                    <p style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#1F2937',
                      lineHeight: '1.4',
                      margin: 0
                    }}>
                      {order.items.map((item: OrderItem, idx: number) => {
                        const product = products.find(p => p.id === item.productId);
                        return `${item.quantity}x ${product?.name || 'Water Product'}${idx < order.items.length - 1 ? ', ' : ''}`;
                      })}
                    </p>
                  </div>

                  {/* Map View */}
                  {showMapId === order.id && order.location && order.orderType !== 'pickup' && (
                    <div className="animate-slide-up" style={{ height: '200px', width: '100%', marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                      <MapContainer 
                        center={[order.location.lat, order.location.lng]} 
                        zoom={15} 
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[order.location.lat, order.location.lng]} />
                      </MapContainer>
                    </div>
                  )}

                  <div style={{ height: '1px', background: '#F3F4F6', marginBottom: '1rem' }}></div>

                  {/* Footer: Service Type and Total */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2" style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>
                      {order.orderType === 'delivery' ? (
                        <>
                          <Truck size={18} style={{ color: '#F59E0B' }} /> 
                          <span>Delivery</span>
                          {showMapId === order.id && <MapPin size={14} className="text-primary animate-bounce" />}
                        </>
                      ) : (
                        <><Store size={18} style={{ color: '#10B981' }} /> Pickup</>
                      )}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      ₱{order.totalAmount.toFixed(2)}
                    </div>
                  </div>

                  {order.cancellation ? (
                    <div style={{ marginTop: '1rem', background: '#FEF3C7', color: '#D97706', padding: '0.75rem', borderRadius: '12px', fontWeight: 700, textAlign: 'center', fontSize: '0.875rem' }}>
                      Cancellation Requested: {order.cancellation.reason}
                    </div>
                  ) : (
                    (order.status === 'pending' || order.status === 'processing') && (
                      <button 
                        className="btn w-full"
                        style={{ marginTop: '1rem', background: '#FEE2E2', color: '#EF4444', padding: '0.75rem', borderRadius: '12px', fontWeight: 700 }}
                        onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                      >
                        Cancel Order
                      </button>
                    )
                  )}
                  {(order.status === 'cancelled' || order.status === 'delivered') && (
                    <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                      <button 
                        className="btn"
                        style={{ flex: 1, background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '0.75rem', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        onClick={(e) => { e.stopPropagation(); handleReorder(order); }}
                      >
                        <RefreshCw size={16} /> Reorder
                      </button>
                      <button 
                        className="btn"
                        style={{ flex: 1, background: '#FEE2E2', color: '#EF4444', padding: '0.75rem', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
