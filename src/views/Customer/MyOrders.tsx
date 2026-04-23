import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/Store';
import type { Order, OrderItem } from '../../store/Store';
import { Clock, CheckCircle, Package, Truck, XCircle, Store, Trash2, ChevronLeft, RefreshCw, Ban } from 'lucide-react';

export const MyOrders: React.FC = () => {
  const { orders, currentUser, products, updateOrderStatus, deleteOrder } = useStore();
  const navigate = useNavigate();
  const [swipedOrderId, setSwipedOrderId] = useState<string | null>(null);

  // Interaction State
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Filter orders for the current user
  const myOrders = orders.filter(o => o.userId === currentUser?.id);

  // Universal Drag Handlers (Touch + Mouse)
  const onStart = (clientX: number) => {
    setDragStart(clientX);
    setIsDragging(true);
  };

  const onMove = (clientX: number, orderId: string, status: string) => {
    if (!isDragging || !dragStart) return;
    // Allow swipe for pending (cancel) and cancelled (reorder/delete)
    if (status !== 'pending' && status !== 'cancelled') return;

    const diff = dragStart - clientX;

    // Threshold to reveal
    if (diff > 50) {
      setSwipedOrderId(orderId);
    } else if (diff < -50) {
      setSwipedOrderId(null);
    }
  };

  const onEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'processing': return <Package size={14} />;
      case 'out-for-delivery': return <Truck size={14} />;
      case 'delivered': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#F59E0B'; // Amber
      case 'processing': return '#3B82F6'; // Blue
      case 'out-for-delivery': return '#25A9E2'; // Primary
      case 'delivered': return '#10B981'; // Green
      case 'cancelled': return '#EF4444'; // Red
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      updateOrderStatus(orderId, 'cancelled');
      setSwipedOrderId(null);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Permanently delete this order from history?')) {
      deleteOrder(orderId);
      setSwipedOrderId(null);
    }
  };

  const handleReorder = (order: Order) => {
    if (order.items.length > 0) {
      // For now, reorder the first item
      navigate(`/order?productId=${order.items[0].productId}`);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' • ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Close swipe on global click/touch
  useEffect(() => {
    const handleGlobalAction = () => {
      if (!isDragging) {
        // setSwipedOrderId(null); // Optional
      }
    };
    window.addEventListener('mousedown', handleGlobalAction);
    window.addEventListener('touchstart', handleGlobalAction);
    return () => {
      window.removeEventListener('mousedown', handleGlobalAction);
      window.removeEventListener('touchstart', handleGlobalAction);
    };
  }, [isDragging]);

  const stages: Order['status'][] = ['pending', 'processing', 'out-for-delivery', 'delivered'];

  const StatusStepper = ({ currentStatus }: { currentStatus: Order['status'] }) => {
    if (currentStatus === 'cancelled') return null;
    
    const currentIndex = stages.indexOf(currentStatus);
    
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
                {getStatusIcon(status)}
              </div>
              <span style={{ 
                fontSize: '0.6rem', marginTop: '0.5rem', fontWeight: isActive ? 800 : 500, 
                color: isActive ? 'var(--color-text)' : '#9CA3AF',
                textAlign: 'center', maxWidth: '60px', textTransform: 'capitalize'
              }}>
                {status.replace('-', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="animate-slide-up" style={{ userSelect: 'none' }}>
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
                  background: order.status === 'pending' ? '#EF4444' : '#F3F4F6' // Background for actions
                }}
              >

                {/* Actions Behind Card */}
                {order.status === 'pending' ? (
                  <div
                    style={{
                      position: 'absolute', top: 0, right: 0, bottom: 0, width: '100px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', cursor: 'pointer', zIndex: 1, fontWeight: 800, fontSize: '0.8rem', flexDirection: 'column', gap: '4px'
                    }}
                    onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                  >
                    <Ban size={20} />
                    <span>Cancel</span>
                  </div>
                ) : order.status === 'cancelled' ? (
                  <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, display: 'flex', zIndex: 1, width: '160px' }}>
                    <div
                      style={{
                        flex: 1, background: 'var(--color-primary)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px',
                        fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer'
                      }}
                      onClick={(e) => { e.stopPropagation(); handleReorder(order); }}
                    >
                      <RefreshCw size={20} />
                      <span>Reorder</span>
                    </div>
                    <div
                      style={{
                        flex: 1, background: '#EF4444', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px',
                        fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer'
                      }}
                      onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                    >
                      <Trash2 size={20} />
                      <span>Remove</span>
                    </div>
                  </div>
                ) : null}

                {/* Main Card Content */}
                <div
                  className="product-card"
                  onMouseDown={(e) => onStart(e.clientX)}
                  onMouseMove={(e) => onMove(e.clientX, order.id, order.status)}
                  onMouseUp={onEnd}
                  onMouseLeave={onEnd}
                  onTouchStart={(e) => onStart(e.targetTouches[0].clientX)}
                  onTouchMove={(e) => onMove(e.targetTouches[0].clientX, order.id, order.status)}
                  onTouchEnd={onEnd}
                  style={{
                    padding: '1.5rem',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    boxShadow: 'none',
                    borderRadius: '16px',
                    position: 'relative',
                    zIndex: 2,
                    transform: swipedOrderId === order.id ? `translateX(-${order.status === 'cancelled' ? '160' : '100'}px)` : 'translateX(0)',
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: (order.status === 'pending' || order.status === 'cancelled') ? 'grab' : 'default',
                    touchAction: 'pan-y'
                  }}
                >
                  {/* Header: Date and Status */}
                  <div className="flex justify-between items-center mb-6">
                    <div style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 500 }}>
                      {formatDateTime(order.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === 'cancelled' ? (
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
                      ) : (
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: getStatusColor(order.status) }}>
                          {swipedOrderId !== order.id && <ChevronLeft size={16} className="text-gray-300 animate-pulse inline" />}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stepper for non-cancelled orders */}
                  <StatusStepper currentStatus={order.status} />

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

                  <div style={{ height: '1px', background: '#F3F4F6', marginBottom: '1rem' }}></div>

                  {/* Footer: Service Type and Total */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2" style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>
                      {order.orderType === 'delivery' ? (
                        <><Truck size={18} style={{ color: '#F59E0B' }} /> Delivery</>
                      ) : (
                        <><Store size={18} style={{ color: '#10B981' }} /> Pickup</>
                      )}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      ₱{order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
