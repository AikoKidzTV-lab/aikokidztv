import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

if (typeof window !== 'undefined') {
  const root = document.documentElement;
  root.setAttribute('lang', 'en');
  root.classList.remove('dark');
  root.setAttribute('data-theme', 'light');

  const darkModeGuard = new MutationObserver(() => {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  });
  darkModeGuard.observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'] });

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

  const handleBackHomeClick = (event) => {
    const target = event.target?.closest?.('button,a');
    if (!target) return;
    const label = String(target.textContent || '').toLowerCase();
    if (!label.includes('back') && !label.includes('home')) return;
    window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
  };

  document.addEventListener('click', handleBackHomeClick, true);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
