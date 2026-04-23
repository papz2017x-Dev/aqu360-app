import React, { useState, useRef } from 'react';
import { useStore } from '../../store/Store';
import type { Order, OrderStatus, Product, User, UserRole } from '../../store/Store';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LayoutDashboard, Map as MapIcon, List, Plus, Edit, Trash2, X, Save, ShieldCheck, Camera, Upload, Truck, Store, MessageSquare, Settings } from 'lucide-react';

// Fix Leaflet's default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const Dashboard: React.FC = () => {
  const { 
    orders, updateOrderStatus, 
    products, addProduct, updateProduct, deleteProduct,
    users, currentUser, updateUserRole,
    deliveryFee, setGlobalDeliveryFee
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users' | 'settings'>('orders');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
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
        setFormProduct({ ...formProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing === 'new') {
      addProduct(formProduct);
    } else if (isEditing) {
      updateProduct({ ...formProduct, id: isEditing });
    }
    setIsEditing(null);
    setFormProduct({ name: '', description: '', price: 0, image: '' });
  };

  const handleUpdateFee = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalDeliveryFee(Number(tempDeliveryFee));
    alert('Delivery fee updated successfully!');
  };

  return (
    <div className="animate-slide-up">
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutDashboard size={24} className="text-primary" /> Management
          </h2>
          <div className="flex gap-1 bg-gray-100 p-1" style={{ borderRadius: '12px', overflowX: 'auto', maxWidth: '100%' }}>
            <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} label="Orders" />
            <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} label="Stock" />
            {isSuperuser && <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Team" />}
            {isSuperuser && <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Settings" />}
          </div>
        </div>

        {activeTab === 'orders' && (
          <div className="flex gap-3">
            <div className="flex-1 p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="text-2xl font-black text-primary">{pendingCount}</div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider">Pending</div>
            </div>
            <div className="flex-1 p-4 rounded-2xl bg-green-50 border border-green-100">
              <div className="text-2xl font-black text-green-600">₱{revenue.toFixed(0)}</div>
              <div className="text-xs font-bold text-green-600 uppercase tracking-wider">Revenue</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '1.5rem' }}>
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
                  <div key={order.id} className="product-card" style={{ padding: '1.25rem' }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{order.customerName}</div>
                        <div className="flex items-center gap-1 text-xs font-bold text-primary">
                          {order.orderType === 'delivery' ? <Truck size={12} /> : <Store size={12} />}
                          <span style={{ textTransform: 'uppercase' }}>{order.orderType}</span>
                        </div>
                      </div>
                      <span className="font-black text-primary">₱{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted mb-4">{order.address}</p>
                    
                    {order.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg flex gap-2 items-start border border-gray-100">
                        <MessageSquare size={14} className="text-muted mt-0.5" />
                        <p className="text-xs text-muted italic">"{order.notes}"</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="text-xs font-bold text-muted">#{order.id.toUpperCase()}</span>
                      <select className="input" style={{ width: 'auto', padding: '0.4rem 0.8rem', height: 'auto', fontSize: '0.8rem', fontWeight: 700, borderRadius: '8px' }} value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}>
                        {statuses.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-center text-muted p-12">No orders found.</p>}
              </div>
            ) : (
              <div className="product-card" style={{ padding: 0, overflow: 'hidden', height: '450px' }}>
                <MapContainer center={[14.5995, 120.9842]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {orders.map((order: Order) => order.location && (
                    <Marker key={order.id} position={[order.location.lat, order.location.lng]}>
                      <Popup><strong>{order.customerName}</strong><br/>{order.address}<br/>Status: {order.status}</Popup>
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

const TabButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button className={`btn ${active ? 'btn-primary' : ''}`} style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', height: 'auto', background: active ? '' : 'transparent', color: active ? '' : 'var(--color-text)', borderRadius: '10px', whiteSpace: 'nowrap' }} onClick={onClick}>
    {label}
  </button>
);
