import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/Store';
import { LogOut, Save, UserCircle, Phone, MapPin, Mail } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, updateProfile, deleteAccount, logout } = useStore();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  });
  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!currentUser) {
    return <div className="text-center p-8">Please login to view profile.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(currentUser.id, formData);
    setIsSaved(true);
    setIsEditing(false);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDelete = async () => {
    if (window.confirm('CRITICAL: This will permanently delete your account and all data. This action cannot be undone. Proceed?')) {
      await deleteAccount(currentUser.id);
      navigate('/login');
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
        <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>Profile</h2>
        <button 
          className="btn" 
          style={{ padding: '0.4rem 0.8rem', background: '#F3F4F6', color: '#6B7280', fontSize: '0.875rem' }} 
          onClick={handleLogout}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div className="flex-col gap-6" style={{ display: 'flex' }}>
          
          {/* Profile Card */}
          <div className="product-card" style={{ padding: '1.5rem' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
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
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="btn"
                style={{ background: isEditing ? '#F3F4F6' : 'var(--color-primary-light)', color: isEditing ? '#4B5563' : 'var(--color-primary)', padding: '0.5rem 1rem' }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-col gap-5" style={{ display: 'flex' }}>
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Full Name</label>
                {isEditing ? (
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
                ) : (
                  <div className="flex items-center gap-3 px-1">
                    <UserCircle size={20} className="text-muted" />
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{currentUser.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Phone Number</label>
                {isEditing ? (
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
                ) : (
                  <div className="flex items-center gap-3 px-1">
                    <Phone size={20} className="text-muted" />
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{currentUser.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Default Delivery Address</label>
                {isEditing ? (
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
                ) : (
                  <div className="flex items-start gap-3 px-1">
                    <MapPin size={20} className="text-muted mt-1" />
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{currentUser.address}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <button type="submit" className="btn btn-primary w-full mt-4" style={{ padding: '1rem' }}>
                  <Save size={18} /> Save Profile Changes
                </button>
              )}
            </form>
          </div>

          {isSaved && (
            <div className="animate-slide-up" style={{ padding: '0.75rem', background: '#DCFCE7', color: '#166534', borderRadius: '12px', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
              ✓ Profile updated successfully!
            </div>
          )}

          {/* Danger Zone */}
          <div className="product-card" style={{ padding: '1.5rem', border: '1px solid #FEE2E2', background: '#FFF7F7' }}>
            <h3 style={{ color: '#991B1B', margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 800 }}>Danger Zone</h3>
            <p style={{ fontSize: '0.8rem', color: '#7F1D1D', marginBottom: '1.5rem' }}>Once you delete your account, there is no going back. Please be certain.</p>
            
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="btn" 
                style={{ width: '100%', background: '#FEE2E2', color: '#991B1B', fontWeight: 700 }}
              >
                Delete Account
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleDelete}
                  className="btn" 
                  style={{ flex: 1, background: '#EF4444', color: 'white' }}
                >
                  Yes, Delete Permanently
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn" 
                  style={{ flex: 1, background: 'white', border: '1px solid #E5E7EB' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
