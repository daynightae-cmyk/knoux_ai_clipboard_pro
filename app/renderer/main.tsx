/**
 * Knoux Clipboard AI - Renderer Main Entry Point
 * React application bootstrap and initialization
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { MainDashboard } from './components/MainDashboard';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MainDashboard />
  </React.StrictMode>
);

