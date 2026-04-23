import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/Store';
import { LogIn, Mail, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex-col items-center justify-center p-6 animate-slide-up" style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)', padding: '3rem 1.5rem' }}>

      {/* Centered Logo with Margin */}
      <div className="text-center" style={{ marginBottom: '1rem', marginTop: '0rem' }}>
        <div
          style={{
            margin: '0 auto',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',        // makes it round
            overflow: 'hidden',         // ensures the image stays inside the circle
          }}
        >
          <img
            src="/a360.png"
            alt="Aqua360 Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>


      {/* Centered Welcome Label */}
      <div className="text-center mb-10">
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 900,
          color: 'var(--color-primary)',
          marginBottom: '0.05rem',
          letterSpacing: '-0.04em',
          textAlign: 'center'
        }}>
          Welcome
        </h2>
        <p className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.8 }}>
          Pure water delivered to your doorstep.
        </p>
      </div>
      <hr style={{ color: 'var(--color-bg)', marginBottom: '2rem' }}></hr>

      <div className="product-card w-full " style={{
        maxWidth: '400px',
        padding: '2.75rem 2.25rem',
        borderRadius: '28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)'
      }}>
        <form onSubmit={handleSubmit} className="flex-col gap-8" style={{ display: 'flex' }}>
          {error && (
            <div style={{ padding: '1.25rem', background: '#FEF2F2', color: '#DC2626', borderRadius: '16px', fontSize: '0.875rem', textAlign: 'center', fontWeight: 700, border: '1px solid #FEE2E2' }}>
              {error}
            </div>
          )}

          {/* Email Allowance */}
          <div>
            <label className="text-sm font-black text-gray-700 mb-3 block uppercase tracking-wider ml-1">Email Address</label>
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 border border-gray-200 focus-within:border-primary focus-within:bg-white transition-all duration-300">
              <Mail size={20} className="text-gray-400" />
              <input
                type="email"
                className="input"
                style={{ border: 'none', background: 'transparent', padding: '1.25rem 0', fontWeight: 600, fontSize: '1rem' }}
                placeholder="name@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Allowance */}
          <div>
            <label className="text-sm font-black text-gray-700 mb-3 block uppercase tracking-wider ml-1">Password</label>
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 border border-gray-200 focus-within:border-primary focus-within:bg-white transition-all duration-300">
              <Lock size={20} className="text-gray-400" />
              <input
                type="password"
                className="input"
                style={{ border: 'none', background: 'transparent', padding: '1.25rem 0', fontWeight: 600, fontSize: '1rem' }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Button Allowance */}
          <button type="submit" className="btn btn-primary w-full mt-2" style={{
            padding: '0.90rem',
            borderRadius: '20px',
            fontSize: '1.25rem',
            fontWeight: 800,
            boxShadow: '0 10px 15px -3px rgba(37, 169, 226, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}>
            <LogIn size={22} /> Sign In
          </button>
        </form>
        <div
          className="flex-col items-center justify-center p-6 animate-slide-up"
          style={{
            minHeight: '1vh',
            display: 'flex',

            padding: '0.1rem 0.5rem',
          }}
        >
          <div className="text-center mt-4 text-sm">
            <hr style={{ border: 'none', height: 0, marginBottom: '1rem' }}></hr>
            <span className="text-muted font-bold mr-1">New to Aqua360? </span>
            <Link to="/signup" className="font-black text-primary hover:underline decoration-2 underline-offset-4">Register</Link>
          </div>
        </div>
      </div>

      {/* Demo Credentials Section Allowance */}
      {/* <div className="mt-16 p-8 bg-white border border-gray-100 rounded-3xl shadow-sm" style={{ width: '100%', maxWidth: '360px' }}>
        <p className="font-black text-primary mb-6 uppercase tracking-[0.2em] text-[11px] text-center">Admin Demo Access</p>
        <div className="flex-col gap-3" style={{ display: 'flex' }}>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</span>
            <code className="text-sm font-bold text-gray-700">admin@aqu360.com</code>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pass</span>
            <code className="text-sm font-bold text-gray-700">admin123</code>
          </div>
        </div>
      </div> */}
    </div>
  );
};
