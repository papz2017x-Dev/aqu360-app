import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/Store';
import { LogOut, Save, UserCircle, Phone, MapPin, Mail } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, updateProfile, logout } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  });
  const [isSaved, setIsSaved] = useState(false);

  if (!currentUser) {
    return <div className="text-center p-8">Please login to view profile.</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(currentUser.id, formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="animate-slide-up">
      <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Account Settings</h2>
        <button 
          className="btn" 
          style={{ padding: '0.4rem 0.8rem', background: 'var(--color-bg)', color: 'var(--color-danger)', fontSize: '0.875rem' }} 
          onClick={handleLogout}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} className="flex-col gap-6" style={{ display: 'flex' }}>
          
          <div className="product-card" style={{ padding: '1.5rem' }}>
            <div className="flex items-center gap-4 mb-8">
              <div style={{ 
                width: '72px', 
                height: '72px', 
                background: 'var(--color-primary-light)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--color-primary)', 
                fontSize: '1.75rem', 
                fontWeight: 800 
              }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-xl">{currentUser.name}</div>
                <div className="flex items-center gap-1 text-sm text-muted">
                  <Mail size={14} /> {currentUser.email}
                </div>
                <div className="badge badge-blue mt-2" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                  {currentUser.role} Account
                </div>
              </div>
            </div>

            <div className="flex-col gap-5" style={{ display: 'flex' }}>
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Full Name</label>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-1 border border-gray-100 focus-within:border-primary">
                  <UserCircle size={20} className="text-muted" />
                  <input 
                    type="text" 
                    className="input" 
                    style={{ border: 'none', background: 'transparent', padding: '0.75rem 0' }}
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Phone Number</label>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-1 border border-gray-100">
                  <Phone size={20} className="text-muted" />
                  <input 
                    type="tel" 
                    className="input" 
                    style={{ border: 'none', background: 'transparent', padding: '0.75rem 0' }}
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Default Delivery Address</label>
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <MapPin size={20} className="text-muted mt-1" />
                  <textarea 
                    className="input" 
                    style={{ border: 'none', background: 'transparent', padding: 0 }}
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    rows={3}
                    required 
                  />
                </div>
              </div>
            </div>
          </div>

          {isSaved && (
            <div className="animate-slide-up" style={{ padding: '0.75rem', background: '#DCFCE7', color: '#166534', borderRadius: '12px', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
              ✓ Profile updated successfully!
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" style={{ padding: '1rem' }}>
            <Save size={18} /> Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
};
