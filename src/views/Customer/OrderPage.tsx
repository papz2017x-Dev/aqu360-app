import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/Store';
import type { OrderType, CartItem } from '../../store/Store';
import { MapPin, CheckCircle, Droplets, Minus, Plus, Truck, Store, Navigation, Banknote, Trash2, ShoppingBag } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const OrderPage: React.FC = () => {
  const { products, addOrder, currentUser, deliveryFee: globalDeliveryFee, cart, updateCartItem, removeFromCart, clearSelectedFromCart } = useStore();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName] = useState(currentUser?.name || '');
  const [contactNumber, setContactNumber] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [notes, setNotes] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Selected items logic
  const selectedCartItems = cart.filter(item => item.selected);
  const itemsTotal = selectedCartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);
  
  // Delivery fee logic: if delivery is chosen, calculate per selected item or flat? 
  // Previous logic was globalDeliveryFee * quantity. We'll do globalDeliveryFee * total_selected_quantity
  const totalSelectedQuantity = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? globalDeliveryFee * totalSelectedQuantity : 0;
  const totalAmount = itemsTotal + deliveryFee;

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setUserCoords(newCoords);
        setAddress(`Pinned Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      }, (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your location. Please enter your address manually.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setUserCoords({ lat, lng });
        setAddress(`Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      },
    });
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCartItems.length === 0 || loading) return;

    setLoading(true);
    try {
      await addOrder({
        customerName,
        contactNumber,
        address,
        orderType,
        deliveryFee,
        notes,
        items: selectedCartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: products.find(p => p.id === item.productId)?.price || 0
        })),
        totalAmount,
        location: userCoords || { lat: 14.5995, lng: 120.9842 }
      });
      clearSelectedFromCart();
      setOrderComplete(true);
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="flex-col items-center justify-center text-center p-4 animate-slide-up" style={{ minHeight: '80vh', display: 'flex' }}>
        <div style={{ background: 'var(--color-primary-light)', padding: '2rem', borderRadius: '50%', marginBottom: '2rem' }}>
          <CheckCircle size={80} className="text-primary" />
        </div>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>Order Confirmed!</h2>
        <p className="text-muted" style={{ marginBottom: '2.5rem', maxWidth: '300px' }}>Your water delivery is being processed and will be delivered fast.</p>
        <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem' }} onClick={() => navigate('/orders')}>
          Track My Order
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex-col items-center justify-center text-center p-8 animate-slide-up" style={{ minHeight: '80vh', display: 'flex' }}>
        <div style={{ background: '#F3F4F6', padding: '2rem', borderRadius: '50%', marginBottom: '2rem', color: '#9CA3AF' }}>
          <ShoppingBag size={80} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your cart is empty</h2>
        <p className="text-muted mb-8">Add some products to your cart to start ordering.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go to Products
        </button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ paddingBottom: '2rem' }}>
      <div className="p-6 bg-white border-b border-gray-100 mb-6">
        <h2 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 900, color: 'var(--color-text)' }}>My Cart</h2>
        <p className="text-muted text-sm">{cart.length} items in your list</p>
      </div>

      <div style={{ padding: '0 1.25rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Items in Cart</h3>
            {cart.map((item: CartItem) => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;

              return (
                <div key={item.productId} className="product-card" style={{ padding: '1.25rem', flexDirection: 'row', alignItems: 'center', gap: '1rem', border: item.selected ? '1px solid var(--color-primary)' : '1px solid #F3F4F6', opacity: item.selected ? 1 : 0.7 }}>
                  {/* Checkbox */}
                  <div 
                    onClick={() => updateCartItem(item.productId, { selected: !item.selected })}
                    style={{ 
                      width: '24px', height: '24px', borderRadius: '6px', 
                      border: `2px solid ${item.selected ? 'var(--color-primary)' : '#D1D5DB'}`,
                      background: item.selected ? 'var(--color-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0
                    }}
                  >
                    {item.selected && <CheckCircle size={16} color="white" />}
                  </div>

                  {/* Image */}
                  <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid #F3F4F6' }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Droplets size={32} className="text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                    <p className="text-muted text-xs mb-1">₱{product.price.toFixed(2)} each</p>
                    <div className="flex items-center gap-2">
                       <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button type="button" onClick={() => updateCartItem(item.productId, { quantity: Math.max(1, item.quantity - 1) })} style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #E5E7EB' }}>
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button type="button" onClick={() => updateCartItem(item.productId, { quantity: item.quantity + 1 })} style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #E5E7EB' }}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.productId)} style={{ color: '#EF4444', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Item Total */}
                  <div style={{ textAlign: 'right', fontWeight: 800, color: item.selected ? 'var(--color-primary)' : '#9CA3AF' }}>
                    ₱{(product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Type */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">Service Options</h3>
            <div className="flex gap-3">
              <div
                onClick={() => setOrderType('delivery')}
                style={{
                  flex: 1,
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: orderType === 'delivery' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: orderType === 'delivery' ? 'var(--color-primary-light)' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {orderType === 'delivery' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>}
                </div>
                <div>
                  <div className="flex items-center gap-1 font-bold text-sm">
                    <Truck size={18} className="text-primary" /> Delivery
                  </div>
                  <div className="text-xs text-muted">Refill + Transport</div>
                </div>
              </div>

              <div
                onClick={() => setOrderType('pickup')}
                style={{
                  flex: 1,
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: orderType === 'pickup' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: orderType === 'pickup' ? 'var(--color-primary-light)' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {orderType === 'pickup' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>}
                </div>
                <div>
                  <div className="flex items-center gap-1 font-bold text-sm">
                    <Store size={18} className="text-primary" /> Pickup
                  </div>
                  <div className="text-xs text-muted">Free Refill Only</div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address & Map Picker */}
          {orderType === 'delivery' && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">Delivery Location</h3>
              
              <div style={{ height: '200px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid var(--color-border)', position: 'relative' }}>
                <MapContainer 
                  center={userCoords ? [userCoords.lat, userCoords.lng] : [14.5995, 120.9842]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapEvents />
                  {userCoords && (
                    <>
                      <ChangeView center={[userCoords.lat, userCoords.lng]} />
                      <Marker 
                        position={[userCoords.lat, userCoords.lng]} 
                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            setUserCoords({ lat: position.lat, lng: position.lng });
                            setAddress(`Pinned Location (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`);
                          },
                        }}
                      />
                    </>
                  )}
                </MapContainer>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 400 }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleUseLocation}
                    style={{ background: 'white', border: '1px solid var(--color-border)', padding: '0.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}
                    title="Use Current Location"
                  >
                    <Navigation size={18} className="text-primary" />
                  </button>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <MapPin size={18} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
                <textarea
                  className="input"
                  rows={2}
                  style={{ paddingLeft: '3rem' }}
                  placeholder="Enter your full delivery address..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Customer Details</h3>
            <div>
              <label className="text-xs font-bold text-muted mb-1 block">Contact Number</label>
              <input
                type="tel"
                className="input"
                placeholder="09XX XXX XXXX"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted mb-1 block">Notes (optional)</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Any special instructions..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="product-card" style={{ background: 'white', display: 'flex', flexDirection: 'column', border: '2px solid #F3F4F6' }}>
            <div style={{ padding: '1.5rem 1.5rem 0' }}>
              <h3 className="font-bold mb-4">Summary</h3>
              <hr style={{ margin: '0 0 1rem' }} />
            </div>

            <div style={{ padding: '0 1.5rem' }}>
              <div className="flex justify-between text-sm text-muted mb-2">
                <span>Selected Items ({totalSelectedQuantity})</span>
                <span>₱{itemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted mb-4">
                <span>Delivery Fee</span>
                <span>₱{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-100">
                <span className="font-bold text-lg">Total Amount</span>
                <span className="font-black text-2xl text-primary">₱{totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ background: 'var(--color-bg)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Banknote size={16} className="text-success" />
                <span>Cash on Delivery only</span>
              </div>
            </div>

            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              <button 
                type="submit" 
                disabled={loading || selectedCartItems.length === 0} 
                className="btn btn-primary w-full" 
                style={{ padding: '1.125rem', fontSize: '1.125rem', borderRadius: '16px', opacity: (loading || selectedCartItems.length === 0) ? 0.6 : 1 }}
              >
                {loading ? 'Processing...' : selectedCartItems.length === 0 ? 'Select items to checkout' : `Place Order — ₱${totalAmount.toFixed(2)}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
