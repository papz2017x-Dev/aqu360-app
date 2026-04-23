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
    <div className="animate-slide-up" style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Top Header */}
      <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>Profile</h2>
        <button 
          className="btn" 
          style={{ padding: '0.5rem 1rem', background: '#F3F4F6', color: '#4B5563', fontSize: '0.875rem', fontWeight: 600, borderRadius: '10px' }} 
          onClick={handleLogout}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ padding: '1.5rem 1.25rem' }}>
        <div className="flex-col gap-5" style={{ display: 'flex' }}>
          
          {/* Main Profile Section */}
          <div className="product-card" style={{ padding: '1.75rem', background: 'white', borderRadius: '24px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  background: 'linear-gradient(135deg, var(--color-primary-light) 0%, #DBEAFE 100%)', 
                  borderRadius: '18px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--color-primary)', 
                  fontSize: '1.5rem', 
                  fontWeight: 900 
                }}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#111827', marginBottom: '2px' }}>{currentUser.name}</div>
                  <div className="flex items-center gap-1 text-sm" style={{ color: '#6B7280', fontWeight: 500 }}>
                    <Mail size={14} /> {currentUser.email}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="btn"
                style={{ 
                  background: isEditing ? '#FEE2E2' : '#EFF6FF', 
                  color: isEditing ? '#EF4444' : '#2563EB', 
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  borderRadius: '12px'
                }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-col gap-6" style={{ display: 'flex' }}>
              {/* Role Badge (Static) */}
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ 
                  background: '#E0F2FE', 
                  color: '#0369A1', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '20px', 
                  fontSize: '0.65rem', 
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {currentUser.role} Account
                </span>
              </div>

              {/* Editable Fields */}
              <div className="flex-col gap-5" style={{ display: 'flex' }}>
                <ProfileField 
                  label="Full Name" 
                  icon={<UserCircle size={20} />} 
                  isEditing={isEditing}
                  value={isEditing ? formData.name : currentUser.name}
                  onChange={(val) => setFormData({...formData, name: val})}
                />

                <ProfileField 
                  label="Phone Number" 
                  icon={<Phone size={20} />} 
                  isEditing={isEditing}
                  value={isEditing ? formData.phone : currentUser.phone}
                  onChange={(val) => setFormData({...formData, phone: val})}
                  type="tel"
                />

                <ProfileField 
                  label="Delivery Address" 
                  icon={<MapPin size={20} />} 
                  isEditing={isEditing}
                  value={isEditing ? formData.address : currentUser.address}
                  onChange={(val) => setFormData({...formData, address: val})}
                  isMultiline
                />
              </div>

              {isEditing && (
                <button type="submit" className="btn btn-primary w-full mt-4" style={{ padding: '1rem', borderRadius: '16px', fontWeight: 800 }}>
                  <Save size={18} /> Save Changes
                </button>
              )}
            </form>
          </div>

          {isSaved && (
            <div className="animate-slide-up" style={{ padding: '0.875rem', background: '#DCFCE7', color: '#166534', borderRadius: '16px', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem', border: '1px solid #BBF7D0' }}>
              ✓ Profile updated successfully!
            </div>
          )}

          {/* Danger Zone Section */}
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '1rem', marginBottom: '0.75rem' }}>Danger Zone</h3>
            <div className="product-card" style={{ padding: '1.5rem', border: '1px solid #FEE2E2', background: 'linear-gradient(to bottom, #FFF, #FFF7F7)', borderRadius: '24px' }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ background: '#FEE2E2', color: '#EF4444', padding: '0.5rem', borderRadius: '10px' }}>
                  <Trash2 size={18} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#991B1B' }}>Delete Account</div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#7F1D1D', marginBottom: '1.5rem', lineHeight: '1.5', fontWeight: 500 }}>
                Once you delete your account, all your data will be permanently removed. This action is irreversible.
              </p>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn" 
                  style={{ width: '100%', background: '#FEE2E2', color: '#991B1B', fontWeight: 800, padding: '0.875rem', borderRadius: '14px' }}
                >
                  Delete My Account
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleDelete}
                    className="btn" 
                    style={{ flex: 1, background: '#EF4444', color: 'white', fontWeight: 800, padding: '0.875rem', borderRadius: '14px' }}
                  >
                    Confirm Delete
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn" 
                    style={{ flex: 1, background: 'white', border: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 800, padding: '0.875rem', borderRadius: '14px' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Helper Components
const ProfileField = ({ label, icon, isEditing, value, onChange, type = "text", isMultiline = false }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.25rem' }}>
      {label}
    </label>
    <div style={{ 
      display: 'flex', 
      alignItems: isMultiline && isEditing ? 'flex-start' : 'center', 
      gap: '0.75rem', 
      padding: '0.875rem 1rem',
      background: isEditing ? '#F9FAFB' : '#F3F4F6',
      borderRadius: '16px',
      border: isEditing ? '2px solid #E5E7EB' : '1px solid transparent',
      transition: 'all 0.2s ease',
      color: '#111827'
    }}>
      <div style={{ color: '#9CA3AF' }}>{icon}</div>
      {isEditing ? (
        isMultiline ? (
          <textarea 
            className="input" 
            style={{ border: 'none', background: 'transparent', padding: 0, fontWeight: 600, fontSize: '0.95rem', width: '100%' }}
            value={value} 
            onChange={e => onChange(e.target.value)} 
            rows={3}
            required 
          />
        ) : (
          <input 
            type={type}
            className="input" 
            style={{ border: 'none', background: 'transparent', padding: 0, fontWeight: 600, fontSize: '0.95rem', width: '100%' }}
            value={value} 
            onChange={e => onChange(e.target.value)} 
            required 
          />
        )
      ) : (
        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', lineHeight: '1.4' }}>{value}</span>
      )}
    </div>
  </div>
);
