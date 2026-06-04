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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed. Please try again.');
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div style={{ padding: '1.25rem', background: '#FEF2F2', color: '#DC2626', borderRadius: '16px', fontSize: '0.875rem', textAlign: 'center', fontWeight: 700, border: '1px solid #FEE2E2' }}>
              {error}
            </div>
          )}

          {/* Email Allowance */}
          <div>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#4B5563',
                marginBottom: '0.5rem',
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingLeft: '0.25rem'
              }}
            >
              Email Address
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: emailFocused ? '#ffffff' : '#F9FAFB',
                borderRadius: '16px',
                padding: '0.875rem 1.25rem',
                border: emailFocused ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                boxShadow: emailFocused ? '0 0 0 4px rgba(37, 169, 226, 0.15)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Mail size={20} className="text-gray-400" />
              <input
                type="email"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  width: '100%',
                  color: 'var(--color-text)',
                  padding: 0,
                }}
                placeholder="name@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                required
              />
            </div>
          </div>

          {/* Password Allowance */}
          <div>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#4B5563',
                marginBottom: '0.5rem',
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingLeft: '0.25rem'
              }}
            >
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: passwordFocused ? '#ffffff' : '#F9FAFB',
                borderRadius: '16px',
                padding: '0.875rem 1.25rem',
                border: passwordFocused ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                boxShadow: passwordFocused ? '0 0 0 4px rgba(37, 169, 226, 0.15)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Lock size={20} className="text-gray-400" />
              <input
                type="password"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  width: '100%',
                  color: 'var(--color-text)',
                  padding: 0,
                }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
              />
            </div>
            <div className="flex" style={{ justifyContent: 'flex-end', marginTop: '0.5rem', paddingRight: '0.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotEmail('');
                  setForgotError('');
                  setTempPasswordToShow('');
                  setIsFallbackSent(false);
                }}
                className="text-xs font-bold hover:underline"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'var(--color-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                Forgot Password?
              </button>
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
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            padding: '2rem',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.35)',
            animation: 'slideUp 0.3s ease'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Key size={20} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111827', margin: 0 }}>Reset Password</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{ background: '#F3F4F6', border: 'none', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px' }}
              >
                <X size={20} />
              </button>
            </div>

            {!tempPasswordToShow && !isFallbackSent ? (
              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                  Enter your registered email address. We'll generate a temporary password you can use to sign in and set a new one.
                </p>

                {forgotError && (
                  <div style={{ padding: '0.875rem 1rem', background: '#FEF2F2', color: '#B91C1C', borderRadius: '14px', fontSize: '0.875rem', fontWeight: 700, border: '1.5px solid #FECACA', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#374151', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Email Address
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: '#F9FAFB',
                    borderRadius: '14px',
                    padding: '0.875rem 1.125rem',
                    border: '1.5px solid #E5E7EB',
                  }}>
                    <Mail size={18} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                    <input
                      type="email"
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 600, fontSize: '1rem', width: '100%', color: '#111827' }}
                      placeholder="your@email.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn btn-primary w-full"
                  style={{
                    padding: '0.9rem',
                    borderRadius: '14px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    boxShadow: '0 8px 16px -4px rgba(37, 169, 226, 0.4)',
                    opacity: forgotLoading ? 0.7 : 1,
                    marginTop: '0.25rem',
                  }}
                >
                  {forgotLoading ? '⏳ Generating...' : 'Get Temporary Password'}
                </button>
              </form>
            ) : tempPasswordToShow ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
                <div style={{ margin: '0 auto', background: '#ECFDF5', color: '#059669', width: '68px', height: '68px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={32} />
                </div>

                <div>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#111827', margin: '0 0 0.5rem 0' }}>Temporary Password Ready!</h4>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                    Copy this password, then click <strong style={{ color: '#111827' }}>"Proceed to Login"</strong> — your fields will be filled automatically.
                  </p>
                </div>

                {/* Temp Password Display Box */}
                <div style={{
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)',
                  border: '2px solid var(--color-primary)',
                  borderRadius: '18px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}>
                  <span style={{
                    fontFamily: '"Courier New", Courier, monospace',
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: '#1D4ED8',
                    letterSpacing: '0.06em',
                    wordBreak: 'break-all',
                    textAlign: 'left',
                    flex: 1,
                    userSelect: 'all',
                  }}>{tempPasswordToShow}</span>
                  <button
                    onClick={handleCopyPassword}
                    style={{
                      background: copied ? '#ECFDF5' : 'var(--color-primary)',
                      color: copied ? '#059669' : '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                      boxShadow: copied ? 'none' : '0 4px 8px -2px rgba(37,169,226,0.4)',
                    }}
                  >
                    {copied ? (
                      <><Check size={16} /> Copied!</>
                    ) : (
                      <><Copy size={16} /> Copy</>
                    )}
                  </button>
                </div>

                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#92400E', fontWeight: 600, textAlign: 'left' }}>
                  💡 This is a one-time temporary password. You'll be required to set a new permanent password after logging in.
                </div>

                <button
                  onClick={handleCloseAndPrefill}
                  className="btn btn-primary w-full"
                  style={{ padding: '0.95rem', borderRadius: '14px', fontWeight: 800, fontSize: '1.05rem', boxShadow: '0 8px 16px -4px rgba(37, 169, 226, 0.4)' }}
                >
                  Proceed to Login →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
                <div style={{ margin: '0 auto', background: '#EFF6FF', color: '#2563EB', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={30} />
                </div>

                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111827', margin: '0 0 0.75rem 0' }}>Reset Email Sent!</h4>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                    A password reset link has been sent to <strong style={{ color: '#111827' }}>{forgotEmail}</strong>. Please check your inbox.
                  </p>
                </div>

                <button
                  onClick={() => setShowForgotModal(false)}
                  className="btn btn-primary w-full"
                  style={{ padding: '0.9rem', borderRadius: '14px', fontWeight: 800 }}
                >
                  Got it, Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
