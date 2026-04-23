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
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { currentUser } = useStore();
  const location = useLocation();

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
    </StoreProvider>
  );
}

export default App;
