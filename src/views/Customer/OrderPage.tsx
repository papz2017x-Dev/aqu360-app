import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/Store';
import type { Product, OrderType } from '../../store/Store';
import { MapPin, CheckCircle, Droplets, Minus, Plus, Truck, Store, Navigation, Banknote } from 'lucide-react';
+import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
+import 'leaflet/dist/leaflet.css';
+import L from 'leaflet';
+
+// Fix Leaflet default icon
+delete (L.Icon.Default.prototype as any)._getIconUrl;
+L.Icon.Default.mergeOptions({
+  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
+  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
+  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
+});

export const OrderPage: React.FC = () => {
  const { products, addOrder, currentUser, deliveryFee: globalDeliveryFee } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName] = useState(currentUser?.name || '');
  const [contactNumber, setContactNumber] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [notes, setNotes] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('productId');
    if (productId) {
      const product = products.find((p: Product) => p.id === productId);
      if (product) setSelectedProduct(product);
    } else if (products.length > 0) {
      setSelectedProduct(products[0]);
    }
  }, [location, products]);

  const deliveryFee = orderType === 'delivery' ? globalDeliveryFee * quantity : 0;
  const itemsTotal = (selectedProduct?.price || 0) * quantity;
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

  // Helper component to update map center
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
    if (!selectedProduct || loading) return;

    setLoading(true);
    try {
      await addOrder({
        customerName,
        contactNumber,
        address,
        orderType,
        deliveryFee,
        notes,
        items: [{
          productId: selectedProduct.id,
          quantity,
          price: selectedProduct.price
        }],
        totalAmount,
        location: userCoords || { lat: 14.5995, lng: 120.9842 }
      });
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

  return (
    <div className="animate-slide-up" style={{ paddingBottom: '2rem' }}>
      <div className="p-6 bg-white">
        <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>Your Cart</h2>
      </div>

      <div style={{ padding: '0 1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Cart Item */}
          <div className="product-card" style={{ padding: '1.25rem', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--color-primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {selectedProduct?.image ? (
                <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Droplets size={32} className="text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.2rem' }}>{selectedProduct?.name}</h3>
              <p className="text-muted text-xs mb-1">18.9L • ₱{selectedProduct?.price.toFixed(2)} each</p>
              <div className="font-bold text-primary">₱{((selectedProduct?.price || 0) * quantity).toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Minus size={16} />
              </button>
              <span className="font-bold">{quantity}</span>
              <button type="button" onClick={() => setQuantity(quantity + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Order Type */}
          <div>
            <h3 className="text-sm font-bold mb-3">Order Type</h3>
            <div className="flex gap-3">
              <div
                onClick={() => setOrderType('delivery')}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '12px',
                  border: orderType === 'delivery' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: orderType === 'delivery' ? 'var(--color-primary-light)' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {orderType === 'delivery' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>}
                </div>
                <div>
                  <div className="flex items-center gap-1 font-bold text-sm">
                    <Truck size={16} className="text-primary" /> Delivery
                  </div>
                  <div className="text-xs text-muted">₱{globalDeliveryFee.toFixed(2)} per item</div>
                </div>
              </div>

              <div
                onClick={() => setOrderType('pickup')}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '12px',
                  border: orderType === 'pickup' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: orderType === 'pickup' ? 'var(--color-primary-light)' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {orderType === 'pickup' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>}
                </div>
                <div>
                  <div className="flex items-center gap-1 font-bold text-sm">
                    <Store size={16} className="text-primary" /> Pickup
                  </div>
                  <div className="text-xs text-muted">Free</div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address & Map Picker */}
          <div>
            <h3 className="text-sm font-bold mb-3">Delivery Address</h3>
            
            {/* Map Picker */}
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
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
              Tip: You can also tap/drag the map to pinpoint your location.
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <h3 className="text-sm font-bold mb-3">Phone Number</h3>
            <input
              type="tel"
              className="input"
              placeholder="09XX XXX XXXX"
              value={contactNumber}
              onChange={e => setContactNumber(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-bold mb-3">Notes (optional)</h3>
            <textarea
              className="input"
              rows={2}
              placeholder="Any special instructions..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Order Summary */}
          <div className="product-card" style={{ background: 'white', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem 1.5rem 0' }}>
              <h3 className="font-bold mb-4">Order Summary</h3>
              <hr style={{ margin: '0 0 1rem' }} />
            </div>

            {/* Scrollable items area */}
            <div style={{ overflowY: 'auto', maxHeight: '240px', padding: '0 1.5rem' }}>
              <div className="flex justify-between text-sm text-muted mb-2">
                <span>Items Total</span>
                <span>₱{itemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted mb-4">
                <span>Delivery Fee</span>
                <span>₱{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-100">
                <span className="font-bold text-lg">Total</span>
                <span className="font-black text-xl text-primary">₱{totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ background: 'var(--color-bg)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Banknote size={16} className="text-success" />
                <span>Please prepare ₱{totalAmount.toFixed(2)} — Cash on Delivery</span>
              </div>
            </div>

            {/* Place Order button pinned at bottom of card */}
            <div style={{ padding: '1rem 1.5rem 1.5rem', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
              <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ padding: '1rem', fontSize: '1.125rem', borderRadius: '14px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Placing Order...' : `Place Order — ₱${totalAmount.toFixed(2)}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
