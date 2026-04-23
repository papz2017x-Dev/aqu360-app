import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'out-for-delivery' | 'delivered' | 'cancelled';
export type OrderType = 'delivery' | 'pickup';

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  contactNumber: string;
  address: string;
  orderType: OrderType;
  deliveryFee: number;
  notes?: string;
  location?: { lat: number; lng: number };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export type UserRole = 'user' | 'admin' | 'superuser';

export interface User {
  id: string;
  email: string;
  password?: string; // Mock password
  name: string;
  phone: string;
  address: string;
  role: UserRole;
}

interface AppState {
  products: Product[];
  orders: Order[];
  users: User[];
  currentUser: User | null;
  deliveryFee: number;
  setGlobalDeliveryFee: (fee: number) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  signup: (userData: Omit<User, 'id' | 'role'>) => void;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  updateProfile: (userId: string, data: Partial<User>) => void;
}

const defaultProducts: Product[] = [
  {
    id: 'p1',
    name: '5-Gallon Round Bottle',
    description: 'Standard 5-gallon round bottle, purified drinking water.',
    price: 40,
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'p2',
    name: '5-Gallon Slim Bottle (With Faucet)',
    description: 'Slim type container with built-in faucet for easy dispensing.',
    price: 45,
    image: 'https://images.unsplash.com/photo-1623508154947-2b7e1c8d5b1f?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'p3',
    name: 'Alkaline Water (5-Gallon)',
    description: 'Premium alkaline water for health enthusiasts.',
    price: 70,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=300&q=80',
  }
];

const defaultUsers: User[] = [
  {
    id: 's-1',
    email: 'admin@aqu360.com',
    password: 'admin123',
    name: 'Main Admin',
    phone: '09000000000',
    address: 'HQ Manila',
    role: 'superuser'
  }
];

const StoreContext = createContext<AppState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('aqu360_products');
    return saved ? JSON.parse(saved) : defaultProducts;
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('aqu360_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('aqu360_users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aqu360_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [deliveryFee, setDeliveryFee] = useState<number>(() => {
    const saved = localStorage.getItem('aqu360_delivery_fee');
    return saved ? Number(saved) : 50;
  });

  useEffect(() => {
    localStorage.setItem('aqu360_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('aqu360_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('aqu360_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('aqu360_session', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('aqu360_delivery_fee', deliveryFee.toString());
  }, [deliveryFee]);

  // Settings Methods
  const setGlobalDeliveryFee = (fee: number) => setDeliveryFee(fee);

  // Auth Methods
  const signup = (userData: Omit<User, 'id' | 'role'>) => {
    const newUser: User = {
      ...userData,
      id: 'u-' + Math.random().toString(36).substring(2, 9),
      role: 'user'
    };
    setUsers(prev => [...prev, newUser]);
  };

  const login = (email: string, pass: string): boolean => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  };

  const updateProfile = (userId: string, data: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...data } : u);
    setUsers(updatedUsers);
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, ...data });
    }
  };

  // Order Methods
  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      userId: currentUser?.id,
      id: Math.random().toString(36).substring(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // Product Methods
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: 'p-' + Math.random().toString(36).substring(2, 9),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  return (
    <StoreContext.Provider value={{ 
      products, 
      orders, 
      users,
      currentUser,
      deliveryFee,
      setGlobalDeliveryFee,
      addOrder, 
      updateOrderStatus,
      deleteOrder,
      addProduct,
      updateProduct,
      deleteProduct,
      signup,
      login,
      logout,
      updateUserRole,
      updateProfile
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
