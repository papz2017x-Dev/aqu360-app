import { useState, type ReactNode } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ShoppingCart, ClipboardList, User, LayoutDashboard, HomeIcon, Lock, AlertCircle, Key } from 'lucide-react';
import { useStore } from '../store/Store';

export const AppLayout = () => {
  const { currentUser, orders, updateTempPassword } = useStore();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const canAccessAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superuser';
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const showAdminBanner = canAccessAdmin && pendingOrdersCount > 0;

  // Forced password update states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateTempPassword(newPassword);
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        setSuccess('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-app-container">
      {/* Admin Alert Banner */}
      {showAdminBanner && (
        <div style={{
          background: '#EF4444',
          color: 'white',
          padding: '0.6rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 900,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span>⚠️ YOU HAVE {pendingOrdersCount} PENDING {pendingOrdersCount === 1 ? 'ORDER' : 'ORDERS'}!</span>
          <NavLink to="/admin?view=orders" style={{ color: 'white', textDecoration: 'underline', fontSize: '0.75rem', fontWeight: 900 }}>VIEW NOW</NavLink>
        </div>
      )}

      {/* Top Header - Hidden on Home because Home has Hero Header */}
      {!isHome && (
        <header className="glass" style={{
          position: 'fixed',
          top: showAdminBanner ? '2.5rem' : 0,
          left: 0,
          right: 0,
          height: '4rem',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.25rem',
          zIndex: 50,
          borderBottom: '1px solid var(--color-border)',
          justifyContent: 'space-between',
          transition: 'top 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',   // makes it round
                overflow: 'hidden',    // clips the image inside the circle
              }}
            >
              <img
                src="/a360.png"
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h1
              style={{
                fontSize: '1.25rem',
                color: 'var(--color-primary)',
                margin: 0,
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}
            >
              Aqua360
            </h1>
          </div>

          <div className="flex gap-4 items-center">
            <NavLink to="/profile" style={{ color: 'var(--color-primary)' }}>
              <User size={22} />
            </NavLink>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="main-content" style={{ 
        paddingTop: isHome ? (showAdminBanner ? '2.5rem' : 0) : (showAdminBanner ? '6.5rem' : '4rem'),
        transition: 'padding-top 0.3s ease'
      }}>
        <Outlet />
      </main>

      {/* Bottom Navigation matching Image */}
      <nav className="glass" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTop: '1px solid var(--color-border)',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        <BottomNavItem to="/" icon={<HomeIcon size={24} />} label="Menu" />
        <BottomNavItem to="/order" icon={<ShoppingCart size={24} />} label="Cart" />
        <BottomNavItem to="/orders" icon={<ClipboardList size={24} />} label="Orders" />
        <BottomNavItem to="/profile" icon={<User size={24} />} label="Profile" />
        {canAccessAdmin && (
          <NavLink
            to="/admin"
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              minWidth: '3.5rem',
              textDecoration: 'none'
            })}
          >
            <LayoutDashboard size={24} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Admin</span>
          </NavLink>
        )}
      </nav>

      {/* Force Password Change Modal */}
      {currentUser?.needsPasswordReset && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="bg-white rounded-3xl p-8 w-full animate-slide-up" style={{ maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', boxSizing: 'border-box' }}>
            <div className="text-center mb-6">
              <div style={{ margin: '0 auto 1rem auto', background: 'var(--color-primary-light)', color: 'var(--color-primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={30} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>Update Password</h3>
              <p className="text-muted text-sm font-medium leading-relaxed" style={{ margin: 0 }}>
                You are logged in using a temporary password. For security, please enter a new permanent password.
              </p>
            </div>

            {error && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#FEF2F2', color: '#DC2626', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #FEE2E2', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#ECFDF5', color: '#059669', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #D1FAE5', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircle size={16} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="flex-col gap-5" style={{ display: 'flex' }}>
              <div>
                <label className="text-[10px] font-black text-gray-500 mb-2 block uppercase tracking-wider ml-1">New Password</label>
                <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 border border-gray-200 focus-within:border-primary focus-within:bg-white transition-all duration-300">
                  <Lock size={18} className="text-gray-400" />
                  <input
                    type="password"
                    className="input"
                    style={{ border: 'none', background: 'transparent', padding: '1rem 0', fontWeight: 600, fontSize: '0.95rem', width: '100%' }}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 mb-2 block uppercase tracking-wider ml-1">Confirm New Password</label>
                <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 border border-gray-200 focus-within:border-primary focus-within:bg-white transition-all duration-300">
                  <Lock size={18} className="text-gray-400" />
                  <input
                    type="password"
                    className="input"
                    style={{ border: 'none', background: 'transparent', padding: '1rem 0', fontWeight: 600, fontSize: '0.95rem', width: '100%' }}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-2"
                style={{
                  padding: '0.85rem',
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  boxShadow: '0 8px 12px -3px rgba(37, 169, 226, 0.3)',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Saving password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const BottomNavItem = ({ to, icon, label }: { to: string; icon: ReactNode; label: string }) => {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
        minWidth: '4rem',
        textDecoration: 'none'
      })}
    >
      {icon}
      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{label}</span>
    </NavLink>
  );
};
