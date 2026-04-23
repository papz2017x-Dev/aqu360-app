import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/Store';
import { User, Mail, Lock, Phone, MapPin } from 'lucide-react';

export const Signup: React.FC = () => {
  const { signup } = useStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup(formData);
    navigate('/login');
  };

  return (
    <div className="flex-col items-center justify-center p-6 animate-slide-up" style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)', padding: '3rem 1.5rem 5rem' }}>
      
      {/* Centered Logo with Margin */}
      <div className="text-center" style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
        <div style={{ margin: '0 auto', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/a360.png" alt="Aqua360 Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Centered Join Label */}
      <div className="text-center mb-10">
        <h2 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 900, 
          color: 'var(--color-primary)', 
          marginBottom: '0.75rem', 
          letterSpacing: '-0.04em',
          textAlign: 'center'
        }}>
          Join Aqua360
        </h2>
        <p className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.8 }}>
          Start your journey to pure hydration.
        </p>
      </div>

      <div className="product-card w-full" style={{ 
        maxWidth: '440px', 
        padding: '2.5rem 2rem', 
        borderRadius: '28px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' 
      }}>
        <form onSubmit={handleSubmit} className="flex-col gap-6" style={{ display: 'flex' }}>

          <div>
            <label className="text-sm font-black text-gray-700 mb-2.5 block uppercase tracking-wider ml-1">Full Name</label>
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 border border-gray-200 focus-within:border-primary focus-within:bg-white transition-all duration-300">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                className="input"
                style={{ border: 'none', background: 'transparent', padding: '1.1rem 0', fontWeight: 600, fontSize: '1rem' }}
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-black text-gray-700 mb-2.5 block uppercase tracking-wider ml-1">Email Address</label>
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 border border-gray-200 focus-within:border-primary focus-within:bg-white transition-all duration-300">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                className="input"
                style={{ border: 'none', background: 'transparent', padding: '1.1rem 0', fontWeight: 600, fontSize: '1rem' }}
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-black text-gray-700 mb-2.5 block uppercase tracking-wider ml-1">Phone Number</label>
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 border border-gray-200 focus-within:border-primary focus-within:bg-white transition-all duration-300">
              <Phone size={18} className="text-gray-400" />
              <input
                type="tel"
                className="input"
                style={{ border: 'none', background: 'transparent', padding: '1.1rem 0', fontWeight: 600, fontSize: '1rem' }}
                placeholder="0912 345 6789"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-black text-gray-700 mb-2.5 block uppercase tracking-wider ml-1">Delivery Address</label>
            <div className="flex items-start gap-4 bg-gray-50 rounded-2xl px-5 py-2 border border-gray-200 focus-within:border-primary focus-within:bg-white transition-all duration-300">
              <MapPin size={18} className="text-gray-400 mt-3" />
              <textarea
                className="input"
                style={{ border: 'none', background: 'transparent', padding: '0.8rem 0', fontWeight: 600, fontSize: '1rem', resize: 'none' }}
                placeholder="Enter your street, baranggay, and city"
                rows={2}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-black text-gray-700 mb-2.5 block uppercase tracking-wider ml-1">Password</label>
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 border border-gray-200 focus-within:border-primary focus-within:bg-white transition-all duration-300">
              <Lock size={18} className="text-gray-400" />
              <input
                type="password"
                className="input"
                style={{ border: 'none', background: 'transparent', padding: '1.1rem 0', fontWeight: 600, fontSize: '1rem' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-6" style={{ 
            padding: '1.25rem', 
            borderRadius: '20px', 
            fontSize: '1.25rem', 
            fontWeight: 800,
            boxShadow: '0 10px 15px -3px rgba(37, 169, 226, 0.35)' 
          }}>
            Create Account
          </button>
        </form>

        <div className="text-center mt-12 text-sm">
          <span className="text-muted font-bold mr-1">Already have an account?</span>
          <Link to="/login" className="font-black text-primary hover:underline decoration-2 underline-offset-4">Sign In</Link>
        </div>
      </div>
    </div>
  );
};
