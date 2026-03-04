import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

if (typeof window !== 'undefined') {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  const forceHomeTop = () => {
    if (window.location.pathname !== '/') return;
    if (window.location.hash) {
      window.history.replaceState(window.history.state, '', '/');
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  forceHomeTop();
  window.addEventListener('load', forceHomeTop, { once: true });
  window.addEventListener('pageshow', forceHomeTop);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
