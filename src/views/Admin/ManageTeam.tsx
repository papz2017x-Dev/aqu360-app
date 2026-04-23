import React from 'react';
import { useStore } from '../../store/Store';
import type { User, UserRole } from '../../store/Store';
import { ShieldCheck, ChevronLeft, Mail } from 'lucide-react';

export const ManageTeam: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { users, currentUser, updateUserRole } = useStore();
  const roles: UserRole[] = ['user', 'admin', 'superuser'];

  return (
    <div className="animate-slide-up pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"><ChevronLeft size={20} /></button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Team Management</h2>
          <p className="text-xs text-muted font-bold uppercase tracking-wider">Internal Access Control</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {users.map((user: User) => (
          <div key={user.id} className="product-card p-6 bg-white" style={{ borderRadius: '28px' }}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div style={{ width: '48px', height: '48px', background: 'var(--color-primary)', color: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-black text-gray-900">{user.name}</div>
                  <div className="text-xs text-muted font-medium flex items-center gap-1"><Mail size={12} /> {user.email}</div>
                </div>
              </div>
              <div className="badge badge-blue" style={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.05em' }}>{user.role}</div>
            </div>

            <div className="pt-5 border-t border-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck size={18} className="text-primary" />
                <span className="text-[0.7rem] font-black uppercase text-muted tracking-tighter">Modify Permission Level</span>
              </div>
              <div className="flex gap-2">
                {roles.map(r => (
                  <button 
                    key={r}
                    onClick={() => updateUserRole(user.id, r)}
                    disabled={user.id === currentUser?.id}
                    style={{ 
                      flex: 1, padding: '0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'capitalize',
                      background: user.role === r ? 'var(--color-primary)' : '#F3F4F6',
                      color: user.role === r ? 'white' : '#6B7280',
                      border: 'none', transition: 'all 0.2s ease',
                      opacity: user.id === currentUser?.id ? 0.5 : 1
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
