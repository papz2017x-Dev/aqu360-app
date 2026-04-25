import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './store/Store';
import { AppLayout } from './components/AppLayout';
import { Home } from './views/Customer/Home';
import { OrderPage } from './views/Customer/OrderPage';
import { MyOrders } from './views/Customer/MyOrders';
import { Profile } from './views/Customer/Profile';
import { Dashboard } from './views/Admin/Dashboard';
import { Login } from './views/Auth/Login';
import { Signup } from './views/Auth/Signup';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { currentUser, authLoading } = useStore();
  const location = useLocation();

  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '4px solid rgba(2, 132, 199, 0.1)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <StoreProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Main Layout Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="order" element={<OrderPage />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Admin/Superuser Only */}
              <Route path="admin" element={
                <ProtectedRoute allowedRoles={['admin', 'superuser']}>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </StoreProvider>
  );
}

export default App;
