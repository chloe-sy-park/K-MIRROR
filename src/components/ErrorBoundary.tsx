import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ color: '#FF4D8D', fontSize: 24 }}>K-MIRROR — Runtime Error</h1>
          <pre style={{ background: '#f5f5f5', padding: 20, borderRadius: 12, overflow: 'auto', fontSize: 13, lineHeight: 1.6 }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ marginTop: 20, padding: '12px 24px', background: '#0F0F0F', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
