import React, { useState, useRef } from 'react';
import { useStore } from '../../store/Store';
import type { Order, OrderStatus, Product, User, UserRole } from '../../store/Store';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LayoutDashboard, Map as MapIcon, List, Plus, Edit, Trash2, X, Save, ShieldCheck, Camera, Upload, Truck, Store, MessageSquare, Settings, Navigation, MapPin, BarChart3 } from 'lucide-react';
import { Reports } from './Reports';

// Fix Leaflet's default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getStatusMarker = (status: OrderStatus) => {
  let color = '#3B82F6'; // Default blue
  if (status === 'pending') color = '#EF4444'; // Red
  if (status === 'processing') color = '#3B82F6'; // Blue
  if (status === 'out-for-delivery') color = '#F59E0B'; // Amber
  if (status === 'delivered') color = '#10B981'; // Green
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export const Dashboard: React.FC = () => {
  const { 
    orders, updateOrderStatus, 
    products, addProduct, updateProduct, deleteProduct,
    users, currentUser, updateUserRole,
    deliveryFee, setGlobalDeliveryFee
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users' | 'settings' | 'reports'>('orders');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showMapOrderId, setShowMapOrderId] = useState<string | null>(null);
  
  // Product Form State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formProduct, setFormProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    image: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [tempDeliveryFee, setTempDeliveryFee] = useState(deliveryFee.toString());

  const isSuperuser = currentUser?.role === 'superuser';

  const pendingCount = orders.filter((o: Order) => o.status === 'pending').length;
  const revenue = orders.filter((o: Order) => o.status === 'delivered').reduce((sum: number, o: Order) => sum + o.totalAmount, 0);

  const statuses: OrderStatus[] = ['pending', 'processing', 'out-for-delivery', 'delivered', 'cancelled'];
  const roles: UserRole[] = ['user', 'admin', 'superuser'];

  const handleEditClick = (product: Product) => {
    setIsEditing(product.id);
    setFormProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image to stay within Firestore's 1MB document limit
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 400;
          const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setFormProduct(prev => ({ ...prev, image: compressed }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing === 'new') {
        await addProduct(formProduct);
      } else if (isEditing) {
        await updateProduct({ ...formProduct, id: isEditing });
      }
      setIsEditing(null);
      setFormProduct({ name: '', description: '', price: 0, image: '' });
    } catch (err: any) {
      alert(`Failed to save product: ${err?.message ?? 'Unknown error. The image may be too large — try using an image URL instead.'}`);
    }
  };

  const handleUpdateFee = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalDeliveryFee(Number(tempDeliveryFee));
    alert('Delivery fee updated successfully!');
  };

  return (
    <div className="animate-slide-up" style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="p-4 md:p-6 pb-2">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-4">
            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
              <LayoutDashboard size={24} className="text-primary" /> Management
            </h2>
            
            <div className="flex gap-1 bg-gray-50 p-1 overflow-x-auto no-scrollbar" style={{ borderRadius: '14px', border: '1px solid #F3F4F6' }}>
              <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} label="Orders" icon={<List size={16} />} />
              <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} label="Stock" icon={<Store size={16} />} />
              {isSuperuser && <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Reports" icon={<BarChart3 size={16} />} />}
              {isSuperuser && <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Team" icon={<ShieldCheck size={16} />} />}
              {isSuperuser && <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Settings" icon={<Settings size={16} />} />}
            </div>
          </div>

          {activeTab === 'orders' && (
            <div className="flex gap-2 md:gap-4 mb-2">
              <div className="flex-1 p-3 md:p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-0.5">Pending</div>
                  <div className="text-xl md:text-2xl font-black text-blue-700">{pendingCount}</div>
                </div>
                <Truck size={20} className="text-blue-300" />
              </div>
              <div className="flex-1 p-3 md:p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-0.5">Revenue</div>
                  <div className="text-xl md:text-2xl font-black text-green-700">₱{revenue.toFixed(0)}</div>
                </div>
                <Save size={20} className="text-green-300" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {activeTab === 'reports' && isSuperuser && <Reports />}
        {activeTab === 'orders' && (
          <div className="animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Recent Requests</h3>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setViewMode('list')} className={`btn ${viewMode === 'list' ? 'btn-primary' : ''}`} style={{ padding: '0.3rem 0.6rem', height: 'auto', background: viewMode === 'list' ? '' : 'transparent', color: viewMode === 'list' ? '' : 'var(--color-text)' }}><List size={18} /></button>
                <button onClick={() => setViewMode('map')} className={`btn ${viewMode === 'map' ? 'btn-primary' : ''}`} style={{ padding: '0.3rem 0.6rem', height: 'auto', background: viewMode === 'map' ? '' : 'transparent', color: viewMode === 'map' ? '' : 'var(--color-text)' }}><MapIcon size={18} /></button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="flex-col gap-4" style={{ display: 'flex' }}>
                {orders.map((order: Order) => (
                  <div 
                    key={order.id} 
                    className="product-card" 
                    style={{ 
                      padding: '1.5rem', 
                      cursor: 'pointer',
                      background: 'white',
                      border: showMapOrderId === order.id ? '2px solid var(--color-primary)' : '1px solid #F3F4F6',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      borderRadius: '24px',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setShowMapOrderId(showMapOrderId === order.id ? null : order.id)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '1.125rem', color: '#111827', marginBottom: '4px' }}>{order.customerName}</div>
                        <div className="flex items-center gap-2">
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            padding: '3px 8px', 
                            background: order.orderType === 'delivery' ? '#EFF6FF' : '#F5F3FF', 
                            color: order.orderType === 'delivery' ? '#1D4ED8' : '#6D28D9', 
                            borderRadius: '20px',
                            fontSize: '0.65rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {order.orderType === 'delivery' ? <Truck size={12} /> : <Store size={12} />}
                            {order.orderType}
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--color-primary)' }}>₱{order.totalAmount.toFixed(0)}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mb-4">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <p style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: 500, lineHeight: '1.5' }}>{order.address}</p>
                    </div>

                    {showMapOrderId === order.id && order.location && (
                      <div className="animate-slide-up" style={{ height: '220px', width: '100%', marginBottom: '1.25rem', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                        <MapContainer center={[order.location.lat, order.location.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[order.location.lat, order.location.lng]} icon={getStatusMarker(order.status)} />
                        </MapContainer>
                      </div>
                    )}

                    <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Order Items</div>
                      <div className="flex flex-col gap-2">
                        {order.items.map((item, idx) => {
                          const product = products.find(p => p.id === item.productId);
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span style={{ fontWeight: 700, color: '#374151' }}>{item.quantity}x <span style={{ fontWeight: 500, color: '#6B7280' }}>{product?.name || 'Product'}</span></span>
                              <span style={{ fontWeight: 700, color: '#111827' }}>₱{(item.price * item.quantity).toFixed(0)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {order.notes && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-xl flex gap-2 items-start border border-blue-100">
                        <MessageSquare size={14} className="text-blue-400 mt-0.5" />
                        <p style={{ fontSize: '0.75rem', color: '#1E40AF', fontStyle: 'italic', fontWeight: 500 }}>"{order.notes}"</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#D1D5DB', textTransform: 'uppercase' }}>Order ID</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF' }}>#{order.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                      
                      <select 
                        className="input" 
                        style={{ 
                          width: 'auto', 
                          padding: '0.5rem 1rem', 
                          height: 'auto', 
                          fontSize: '0.8rem', 
                          fontWeight: 800, 
                          borderRadius: '12px',
                          background: '#F3F4F6',
                          border: 'none',
                          color: '#111827'
                        }} 
                        value={order.status} 
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order.id, e.target.value as OrderStatus);
                        }}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center p-16 bg-white rounded-3xl border border-dashed border-gray-200">
                    <LayoutDashboard size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">No orders found.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="product-card" style={{ padding: 0, overflow: 'hidden', height: '450px' }}>
                <MapContainer center={[14.5995, 120.9842]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {orders.map((order: Order) => order.location && (
                    <Marker 
                      key={order.id} 
                      position={[order.location.lat, order.location.lng]}
                      icon={getStatusMarker(order.status)}
                    >
                      <Popup>
                        <div style={{ minWidth: '150px' }}>
                          <strong style={{ fontSize: '1rem' }}>{order.customerName}</strong>
                          <p style={{ margin: '4px 0', fontSize: '0.8rem' }}>{order.address}</p>
                          <div style={{ 
                            display: 'inline-block', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.7rem', 
                            fontWeight: 800,
                            background: `${order.status === 'pending' ? '#FEE2E2' : '#DBEAFE'}`,
                            color: `${order.status === 'pending' ? '#EF4444' : '#1D4ED8'}`,
                            textTransform: 'uppercase',
                            marginBottom: '8px'
                          }}>
                            {order.status}
                          </div>
                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${order.location.lat},${order.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              display: 'block', 
                              textAlign: 'center', 
                              padding: '8px', 
                              background: 'var(--color-primary)', 
                              color: 'white', 
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontWeight: 700,
                              fontSize: '0.8rem'
                            }}
                          >
                            <Navigation size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                            Get Directions
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Stock Management</h3>
              {!isEditing && <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => setIsEditing('new')}><Plus size={18} /> New Product</button>}
            </div>

            {isEditing && (
              <div className="product-card mb-8" style={{ padding: '1.5rem', border: '2px solid var(--color-primary-light)' }}>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-lg">{isEditing === 'new' ? 'Create Product' : 'Modify Product'}</h4>
                  <button className="btn" style={{ padding: '0.4rem', background: 'var(--color-bg)' }} onClick={() => setIsEditing(null)}><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveProduct} className="flex-col gap-4" style={{ display: 'flex' }}>
                  <input className="input" placeholder="Product Name" value={formProduct.name} onChange={e => setFormProduct({...formProduct, name: e.target.value})} required />
                  <textarea className="input" placeholder="Description" value={formProduct.description} onChange={e => setFormProduct({...formProduct, description: e.target.value})} rows={2} required />
                  <input className="input" type="number" placeholder="Price (₱)" value={formProduct.price || ''} onChange={e => setFormProduct({...formProduct, price: Number(e.target.value)})} required />
                  
                  <div className="flex-col gap-3" style={{ display: 'flex' }}>
                    <input
                      className="input"
                      placeholder="Image URL (paste a link, e.g. https://...)"
                      value={formProduct.image.startsWith('data:') ? '' : formProduct.image}
                      onChange={e => setFormProduct({ ...formProduct, image: e.target.value })}
                    />
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>— or upload from device —</div>
                    <div className="flex gap-2">
                      <button type="button" className="btn btn-outline flex-1" style={{ fontSize: '0.8rem', padding: '0.6rem' }} onClick={() => fileInputRef.current?.click()}><Upload size={16} /> Upload</button>
                      <button type="button" className="btn btn-outline flex-1" style={{ fontSize: '0.8rem', padding: '0.6rem' }} onClick={() => { fileInputRef.current?.setAttribute('capture', 'environment'); fileInputRef.current?.click(); }}><Camera size={16} /> Photo</button>
                    </div>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                    {formProduct.image && (
                      <div className="text-center p-2 bg-gray-50 rounded-xl">
                        <img src={formProduct.image} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px' }} />
                      </div>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary w-full mt-2" style={{ padding: '1rem' }}><Save size={18} /> Save Changes</button>
                </form>
              </div>
            )}

            <div className="flex-col gap-3" style={{ display: 'flex' }}>
              {products.map((product: Product) => (
                <div key={product.id} className="product-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="flex items-center gap-4">
                    <div style={{ width: '56px', height: '56px', background: 'var(--color-primary-light)', borderRadius: '12px', overflow: 'hidden' }}>
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div><div className="font-bold">{product.name}</div><div className="text-primary font-black">₱{product.price.toFixed(2)}</div></div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn" style={{ padding: '0.5rem', background: 'var(--color-primary-light)', color: 'var(--color-primary)' }} onClick={() => handleEditClick(product)}><Edit size={18} /></button>
                    <button className="btn" style={{ padding: '0.5rem', background: 'var(--color-bg)', color: 'var(--color-danger)' }} onClick={() => deleteProduct(product.id)}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && isSuperuser && (
          <div className="animate-slide-up">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-6">Internal Team</h3>
            <div className="flex-col gap-4" style={{ display: 'flex' }}>
              {users.map((user: User) => (
                <div key={user.id} className="product-card" style={{ padding: '1.5rem' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div style={{ width: '40px', height: '40px', background: 'var(--color-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{user.name.charAt(0)}</div>
                      <div>
                        <div className="font-bold">{user.name}</div>
                        <div className="text-xs text-muted">{user.email}</div>
                      </div>
                    </div>
                    <div className="badge badge-blue" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>{user.role}</div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <ShieldCheck size={18} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-tighter text-muted">Assign Role</span>
                    <select 
                      className="input flex-1" 
                      style={{ padding: '0.4rem', height: 'auto', fontSize: '0.8rem', fontWeight: 700, borderRadius: '8px' }} 
                      value={user.role} 
                      onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                      disabled={user.id === currentUser?.id}
                    >
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && isSuperuser && (
          <div className="animate-slide-up">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-6">App Settings</h3>
            <div className="product-card" style={{ padding: '2rem' }}>
              <div className="flex items-center gap-3 mb-6">
                <div style={{ background: 'var(--color-primary-light)', padding: '0.75rem', borderRadius: '12px' }}>
                  <Settings size={24} className="text-primary" />
                </div>
                <div>
                  <div className="font-black text-lg">General Configuration</div>
                  <div className="text-sm text-muted">Update global parameters for the app</div>
                </div>
              </div>
              
              <form onSubmit={handleUpdateFee} className="flex-col gap-4" style={{ display: 'flex' }}>
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Standard Delivery Fee (₱ per item)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={tempDeliveryFee} 
                    onChange={e => setTempDeliveryFee(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full mt-2" style={{ padding: '1rem' }}>
                  Update Settings
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button 
    className={`btn ${active ? 'btn-primary shadow-sm' : ''}`} 
    style={{ 
      padding: '0.5rem 1rem', 
      fontSize: '0.8rem', 
      height: 'auto', 
      background: active ? '' : 'transparent', 
      color: active ? '' : '#6B7280', 
      borderRadius: '10px', 
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      fontWeight: 800,
      border: 'none',
      transition: 'all 0.2s ease'
    }} 
    onClick={onClick}
  >
    {icon}
    {label}
  </button>
);
