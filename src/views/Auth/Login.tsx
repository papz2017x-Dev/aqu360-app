import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/Store';
import { LogIn, Mail, Lock, X, Key, Copy, Check, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, resetForgottenPassword } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [tempPasswordToShow, setTempPasswordToShow] = useState('');
  const [isFallbackSent, setIsFallbackSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    const res = await resetForgottenPassword(forgotEmail);
    setForgotLoading(false);
    if (res.success) {
      if (res.isFallback) {
        setIsFallbackSent(true);
      } else if (res.tempPassword) {
        setTempPasswordToShow(res.tempPassword);
      }
    } else {
      setForgotError(res.error || 'Failed to request temporary password.');
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPasswordToShow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseAndPrefill = () => {
    setEmail(forgotEmail);
    setPassword(tempPasswordToShow);
    setShowForgotModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
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
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-black text-gray-700 block uppercase tracking-wider ml-1">Password</label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotEmail('');
                  setForgotError('');
                  setTempPasswordToShow('');
                  setIsFallbackSent(false);
                }}
                className="text-xs font-bold text-primary hover:underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>
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
          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2" style={{
            padding: '0.90rem',
            borderRadius: '20px',
            fontSize: '1.25rem',
            fontWeight: 800,
            boxShadow: '0 10px 15px -3px rgba(37, 169, 226, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Signing in...' : <><LogIn size={22} /> Sign In</>}
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="bg-white rounded-3xl p-8 w-full animate-slide-up" style={{ maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', margin: 0 }}>Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={24} />
              </button>
            </div>

            {!tempPasswordToShow && !isFallbackSent ? (
              <form onSubmit={handleForgotSubmit} className="flex-col gap-5" style={{ display: 'flex' }}>
                <p className="text-muted text-sm font-medium leading-relaxed" style={{ margin: 0 }}>
                  Enter your email address below. We'll generate a temporary password for you to sign in and update your password.
                </p>

                {forgotError && (
                  <div style={{ padding: '0.75rem 1rem', background: '#FEF2F2', color: '#DC2626', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #FEE2E2', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertCircle size={16} />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-gray-500 mb-2 block uppercase tracking-wider ml-1">Email Address</label>
                  <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 border border-gray-200 focus-within:border-primary focus-within:bg-white transition-all duration-300">
                    <Mail size={18} className="text-gray-400" />
                    <input
                      type="email"
                      className="input"
                      style={{ border: 'none', background: 'transparent', padding: '1rem 0', fontWeight: 600, fontSize: '0.95rem', width: '100%' }}
                      placeholder="name@email.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn btn-primary w-full mt-2"
                  style={{
                    padding: '0.85rem',
                    borderRadius: '16px',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    boxShadow: '0 8px 12px -3px rgba(37, 169, 226, 0.3)',
                    opacity: forgotLoading ? 0.7 : 1
                  }}
                >
                  {forgotLoading ? 'Processing...' : 'Get Temporary Password'}
                </button>
              </form>
            ) : tempPasswordToShow ? (
              <div className="flex-col gap-6" style={{ display: 'flex', textAlign: 'center' }}>
                <div style={{ margin: '0 auto', background: '#ECFDF5', color: '#059669', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={28} />
                </div>

                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem 0' }}>Temporary Password Generated!</h4>
                  <p className="text-muted text-sm font-medium leading-relaxed" style={{ margin: 0 }}>
                    Copy this temporary password and use it to sign in. You will be prompted to choose a new password immediately.
                  </p>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-200" style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                  <span>{tempPasswordToShow}</span>
                  <button
                    onClick={handleCopyPassword}
                    className="btn"
                    style={{
                      background: copied ? '#ECFDF5' : 'var(--color-primary-light)',
                      color: copied ? '#059669' : 'var(--color-primary)',
                      padding: '0.5rem 1rem',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copied ? (
                      <>
                        <Check size={14} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleCloseAndPrefill}
                  className="btn btn-primary w-full"
                  style={{ padding: '0.85rem', borderRadius: '16px', fontWeight: 800 }}
                >
                  Proceed to Login
                </button>
              </div>
            ) : (
              <div className="flex-col gap-6" style={{ display: 'flex', textAlign: 'center' }}>
                <div style={{ margin: '0 auto', background: '#EFF6FF', color: '#2563EB', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={28} />
                </div>

                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem 0' }}>Reset Email Sent!</h4>
                  <p className="text-muted text-sm font-medium leading-relaxed" style={{ margin: 0 }}>
                    We've sent a password reset link to <strong>{forgotEmail}</strong>. Please check your email inbox to complete the password reset.
                  </p>
                </div>

                <button
                  onClick={() => setShowForgotModal(false)}
                  className="btn btn-primary w-full"
                  style={{ padding: '0.85rem', borderRadius: '16px', fontWeight: 800 }}
                >
                  Okay
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
