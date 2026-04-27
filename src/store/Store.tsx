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
import { auth, db, messaging } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';

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
export type PaymentMethod = 'cod' | 'gcash' | 'arrangement' | 'on-pickup';

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
  paymentMethod?: PaymentMethod;
  createdAt: string;
  isPaid?: boolean;
  paidAt?: string;
  cancellation?: {
    reason: string;
    requestedAt: string;
  };
}

export type UserRole = 'user' | 'admin' | 'superuser';

export interface CartItem {
  productId: string;
  quantity: number;
  selected: boolean;
}

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
  cart: CartItem[];
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, updates: Partial<CartItem>) => void;
  clearSelectedFromCart: () => void;
  setGlobalDeliveryFee: (fee: number) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  markOrderAsPaid: (orderId: string, method?: PaymentMethod) => Promise<void>;
  requestCancellation: (orderId: string, reason: string) => Promise<void>;
  resolveCancellation: (orderId: string, approved: boolean) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  signup: (userData: { name: string; email: string; phone: string; address: string; password: string }) => Promise<void>;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateProfile: (userId: string, data: Partial<User>) => Promise<void>;
  deleteAccount: (userId: string) => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
}

const defaultProducts: Omit<Product, 'id'>[] = [
  { name: '5-Gallon Round Bottle', description: 'Standard 5-gallon round bottle, purified drinking water.', price: 40, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=300&q=80' },
  { name: '5-Gallon Slim Bottle (With Faucet)', description: 'Slim type container with built-in faucet for easy dispensing.', price: 45, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=300&q=80' },
  { name: 'Alkaline Water (5-Gallon)', description: 'Premium alkaline water for health enthusiasts.', price: 70, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80' },
];

const StoreContext = createContext<AppState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [deliveryFee, setDeliveryFeeState] = useState(50);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('aqu360_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist cart
  useEffect(() => {
    localStorage.setItem('aqu360_cart', JSON.stringify(cart));
  }, [cart]);

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

  // Browser Notification System
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // FCM Token Registration
  useEffect(() => {
    const registerFCM = async () => {
      if (currentUser && "Notification" in window) {
        try {
          console.log('Attempting FCM Token registration...');
          const VAPID_KEY = 'BBNbVLHkWte1rQD45yZMsxBB5wTByTOLHgT00kNgkdAOLUo0MyQKvBZIOEnyTjjGRHVCD6n5EoEt5sC661Z_Mgo'; 

          // Wait for service worker to be ready
          const registration = await navigator.serviceWorker.ready;
          
          const token = await getToken(messaging, { 
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
          });

          if (token) {
            await updateDoc(doc(db, 'users', currentUser.id), { fcmToken: token });
            console.log('FCM Token successfully registered and saved to Firestore');
          }
        } catch (error) {
          console.error('FCM registration failed:', error);
        }
      }
    };
    registerFCM();
  }, [currentUser]);

  // Foreground Message Listener
  useEffect(() => {
    const unsub = onMessage(messaging, (payload) => {
      if (payload.notification) {
        triggerNotification(payload.notification.title || 'Notification', {
          body: payload.notification.body,
        });
      }
    });
    return unsub;
  }, []);

  const [hasInitializedOrders, setHasInitializedOrders] = useState(false);
  const [prevOrders, setPrevOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      if (!hasInitializedOrders) {
        setPrevOrders(orders);
        setHasInitializedOrders(true);
        console.log('Notifications system initialized with', orders.length, 'existing orders');
        return;
      }

      if (!currentUser) return;

      // New Order Notification (Admins)
      if (currentUser.role === 'admin' || currentUser.role === 'superuser') {
        const newOrders = orders.filter(o => !prevOrders.find(po => po.id === o.id));
        newOrders.forEach(o => {
          triggerNotification('New Order Received 🔔', {
            body: `Order from ${o.customerName} for ₱${o.totalAmount.toFixed(0)}`,
            tag: `new-order-${o.id}`
          });
        });
      }

      // Status Change Notification (Users)
      orders.forEach(order => {
        const oldOrder = prevOrders.find(po => po.id === order.id);
        if (oldOrder && oldOrder.status !== order.status) {
          if (order.userId === currentUser?.id) {
            triggerNotification('Order Status Updated 🚀', {
              body: `Your order is now ${order.status.toUpperCase().replace('-', ' ')}`,
              tag: `status-update-${order.id}`
            });
          }
        }
      });

      setPrevOrders(orders);

      // 1. Browser Badge (App Icon Number)
      if ('setAppBadge' in navigator) {
        const pendingCount = orders.filter(o => o.status === 'pending').length;
        if (pendingCount > 0) {
          (navigator as any).setAppBadge(pendingCount).catch((e: any) => console.log('Badge error:', e));
        } else {
          (navigator as any).clearAppBadge().catch((e: any) => console.log('Badge error:', e));
        }
      }
    } catch (err) {
      console.error('CRITICAL: Notification Effect Error:', err);
    }
  }, [orders, currentUser, hasInitializedOrders]);

  // 2. Automatic Refresh on Browser Focus/Wake
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('App returned to foreground, checking for updates...');
        // The onSnapshot listeners automatically reconnect, 
        // but we can add extra logic here if needed.
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  const triggerNotification = (title: string, options: NotificationOptions) => {
    console.log('Notification trigger:', title);
    
    // 1. Safe Audio
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.play().catch(e => console.log('Audio playback blocked or failed:', e.message));
    } catch (e) { 
      console.warn('Audio system error:', e); 
    }

    // 2. Check Notification Support and Permission
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      console.log('Notification skipped: Unsupported or Permission not granted');
      return;
    }

    // 3. Display Notification
    try {
      const nav = navigator as any;
      if ('serviceWorker' in nav) {
        nav.serviceWorker.getRegistration().then((reg: any) => {
          if (reg && 'showNotification' in reg) {
            reg.showNotification(title, {
              ...(options as any),
              icon: '/a360.png',
              badge: '/a360.png',
              vibrate: [200, 100, 200],
              data: { url: window.location.origin + '/orders' }
            });
          } else {
            // Fallback for browsers with SW but no showNotification (rare)
            // Only use 'new Notification' if we are NOT on a mobile device to avoid crashes
            if (!/Mobi|Android|iPhone/i.test(nav.userAgent)) {
              new Notification(title, { ...options, icon: '/a360.png' });
            }
          }
        }).catch((err: any) => {
          console.warn('Service Worker registration check failed:', err);
          if (!/Mobi|Android|iPhone/i.test(nav.userAgent)) {
            new Notification(title, { ...options, icon: '/a360.png' });
          }
        });
      } else if (!/Mobi|Android|iPhone/i.test(nav.userAgent)) {
        // Direct fallback for Desktop browsers without SW
        new Notification(title, { ...options, icon: '/a360.png' });
      }
    } catch (err) {
      console.error('Fatal notification error:', err);
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Re-trigger FCM registration
        const VAPID_KEY = 'BBNbVLHkWte1rQD45yZMsxBB5wTByTOLHgT00kNgkdAOLUo0MyQKvBZIOEnyTjjGRHVCD6n5EoEt5sC661Z_Mgo';
        const registration = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });
        if (token && currentUser) {
          await updateDoc(doc(db, 'users', currentUser.id), { fcmToken: token });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Permission request failed:', err);
      return false;
    }
  };

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

  const deleteAccount = async (userId: string) => {
    await deleteDoc(doc(db, 'users', userId));
    await logout();
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

  const markOrderAsPaid = async (orderId: string, method?: PaymentMethod) => {
    const updateData: any = {
      isPaid: true,
      paidAt: new Date().toISOString()
    };
    if (method) updateData.paymentMethod = method;
    await updateDoc(doc(db, 'orders', orderId), updateData);
  };

  const deleteOrder = async (orderId: string) => {
    await deleteDoc(doc(db, 'orders', orderId));
  };

  const requestCancellation = async (orderId: string, reason: string) => {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists() && orderSnap.data().status === 'pending') {
      // Auto-cancel if still pending
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancellation: null
      });
    } else {
      // Request verification if already processing or beyond
      await updateDoc(orderRef, {
        cancellation: {
          reason,
          requestedAt: new Date().toISOString()
        }
      });
    }
  };

  const resolveCancellation = async (orderId: string, approved: boolean) => {
    if (approved) {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        cancellation: null
      });
    } else {
      await updateDoc(doc(db, 'orders', orderId), {
        cancellation: null
      });
    }
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

  // Cart Methods
  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1, selected: true } : i);
      }
      return [...prev, { productId, quantity: 1, selected: true }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const updateCartItem = (productId: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, ...updates } : i));
  };

  const clearSelectedFromCart = () => {
    setCart(prev => prev.filter(i => !i.selected));
  };

  return (
    <StoreContext.Provider value={{
      products, orders, users, currentUser, authLoading, deliveryFee, cart,
      setGlobalDeliveryFee, addOrder, updateOrderStatus, deleteOrder,
      markOrderAsPaid,
      requestCancellation, resolveCancellation,
      addProduct, updateProduct, deleteProduct,
      signup, login, logout, updateUserRole, updateProfile, deleteAccount,
      requestNotificationPermission,
      addToCart, removeFromCart, updateCartItem, clearSelectedFromCart
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
