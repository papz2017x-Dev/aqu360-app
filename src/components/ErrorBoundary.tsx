import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#F9FAFB'
        }}>
          <h1 style={{ color: '#EF4444', marginBottom: '1rem', fontWeight: 900 }}>Oops! Something went wrong.</h1>
          <p style={{ color: '#6B7280', marginBottom: '2rem' }}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: '#25A9E2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
