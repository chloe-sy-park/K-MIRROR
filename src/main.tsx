import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './i18n';
import './index.css';
import { initAnalytics } from './lib/analytics';
import { initSentry } from './lib/sentry';

initSentry();
initAnalytics();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading K-MIRROR...</div>}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);
