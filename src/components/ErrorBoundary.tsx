import { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** If true, show an inline recovery UI instead of a full-page error */
  inline?: boolean;
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

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.inline) {
        return (
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center space-y-8">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-2xl">!</span>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FF4D8D]">Something went wrong</p>
              <p className="text-sm text-gray-400 max-w-md">
                {this.state.error?.message || 'An unexpected error occurred.'}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4D8D] transition-colors"
              >
                <RotateCcw size={12} /> Retry
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                <Home size={12} /> Home
              </button>
            </div>
          </div>
        );
      }

      // Full-page error (used at root level)
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
