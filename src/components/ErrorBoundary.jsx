import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#090d16', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: '#38bdf8' }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8', marginBottom: '24px', maxWidth: '500px' }}>
            The portfolio encountered a temporary rendering issue. Please refresh the page.
          </p>
          <button 
            onClick={() => {
              localStorage.removeItem('portfolioData');
              window.location.reload();
            }}
            style={{ padding: '12px 24px', backgroundColor: '#06b6d4', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Website
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
