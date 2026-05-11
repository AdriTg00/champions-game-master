import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#1a1a2e',
          color: '#fff',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Error</h1>
          <h2 style={{ marginBottom: '10px' }}>¡Oops! Algo salió mal</h2>
          <p style={{ opacity: 0.7, marginBottom: '20px' }}>
            Ha ocurrido un error inesperado
          </p>
          
          {import.meta.env.DEV && this.state.error && (
            <details style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              maxWidth: '600px',
              textAlign: 'left',
              fontSize: '14px'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Ver detalles del error
              </summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '12px'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '30px',
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: '#00d4ff',
              color: '#1a1a2e',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
