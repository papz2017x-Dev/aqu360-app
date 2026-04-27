import type { ReactNode } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ShoppingCart, ClipboardList, User, LayoutDashboard, HomeIcon } from 'lucide-react';
import { useStore } from '../store/Store';

export const AppLayout = () => {
  const { currentUser, orders } = useStore();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const canAccessAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superuser';
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const showAdminBanner = canAccessAdmin && pendingOrdersCount > 0;

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
