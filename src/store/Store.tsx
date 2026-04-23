import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection, doc, setDoc, addDoc, updateDoc,
  deleteDoc, onSnapshot, query, orderBy, getDoc, getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

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
  authLoading: boolean;
  deliveryFee: number;
  setGlobalDeliveryFee: (fee: number) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  signup: (userData: { name: string; email: string; phone: string; address: string; password: string }) => Promise<void>;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateProfile: (userId: string, data: Partial<User>) => Promise<void>;
}

const defaultProducts: Omit<Product, 'id'>[] = [
  { name: '5-Gallon Round Bottle', description: 'Standard 5-gallon round bottle, purified drinking water.', price: 40, image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=300&q=80' },
  { name: '5-Gallon Slim Bottle (With Faucet)', description: 'Slim type container with built-in faucet for easy dispensing.', price: 45, image: 'https://images.unsplash.com/photo-1623508154947-2b7e1c8d5b1f?auto=format&fit=crop&w=300&q=80' },
  { name: 'Alkaline Water (5-Gallon)', description: 'Premium alkaline water for health enthusiasts.', price: 70, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=300&q=80' },
];

const StoreContext = createContext<AppState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [deliveryFee, setDeliveryFeeState] = useState(50);

  // Seed default data on first run
  useEffect(() => {
    const seed = async () => {
      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) {
        for (const p of defaultProducts) await addDoc(collection(db, 'products'), p);
      }
      const cfg = await getDoc(doc(db, 'settings', 'config'));
      if (!cfg.exists()) await setDoc(doc(db, 'settings', 'config'), { deliveryFee: 50 });
    };
    seed();
  }, []);

  // Firebase Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setCurrentUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Real-time listeners
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'config'), (snap) => {
      if (snap.exists()) setDeliveryFeeState(snap.data().deliveryFee ?? 50);
    });
    return unsub;
  }, []);

  // Auth methods
  const signup = async (userData: { name: string; email: string; phone: string; address: string; password: string }) => {
    const { password, ...profile } = userData;
    const cred = await createUserWithEmailAndPassword(auth, userData.email, password);
    const newProfile = { ...profile, role: 'user' as UserRole };
    await setDoc(doc(db, 'users', cred.user.uid), newProfile);
    setCurrentUser({ id: cred.user.uid, ...newProfile });
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (userDoc.exists()) {
        setCurrentUser({ id: cred.user.uid, ...userDoc.data() } as User);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    await updateDoc(doc(db, 'users', userId), { role });
  };

  const updateProfile = async (userId: string, data: Partial<User>) => {
    await updateDoc(doc(db, 'users', userId), data as Record<string, unknown>);
    if (currentUser?.id === userId) setCurrentUser(prev => prev ? { ...prev, ...data } : null);
  };

  // Order methods
  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    await addDoc(collection(db, 'orders'), {
      ...orderData,
      userId: currentUser?.id ?? '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateDoc(doc(db, 'orders', orderId), { status });
  };

  const deleteOrder = async (orderId: string) => {
    await deleteDoc(doc(db, 'orders', orderId));
  };

  // Product methods
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    await addDoc(collection(db, 'products'), productData);
  };

  const updateProduct = async (updatedProduct: Product) => {
    const { id, ...data } = updatedProduct;
    await updateDoc(doc(db, 'products', id), data);
  };

  const deleteProduct = async (productId: string) => {
    await deleteDoc(doc(db, 'products', productId));
  };

  const setGlobalDeliveryFee = async (fee: number) => {
    await setDoc(doc(db, 'settings', 'config'), { deliveryFee: fee });
  };

  return (
    <StoreContext.Provider value={{
      products, orders, users, currentUser, authLoading, deliveryFee,
      setGlobalDeliveryFee, addOrder, updateOrderStatus, deleteOrder,
      addProduct, updateProduct, deleteProduct,
      signup, login, logout, updateUserRole, updateProfile,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
