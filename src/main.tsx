import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';

import './main.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MotionConfig transition={{ duration: 0.15 }}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </MotionConfig>
  </React.StrictMode>,
);
