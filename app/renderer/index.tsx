import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import './styles/theme-knoux-hotfix.css';
import './services/languageBoot';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
