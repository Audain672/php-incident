/**
 * Main Entry Point
 * Application bootstrap and React initialization
 * @module main
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/**
 * Get the root element
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

/**
 * Create React root and render the app
 */
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * Enable hot module replacement in development
 */
if (process.env.NODE_ENV === 'development' && import.meta.hot) {
  import.meta.hot.accept();
}
