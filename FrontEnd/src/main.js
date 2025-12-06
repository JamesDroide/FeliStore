import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router.js';
import './index.css';
import { AuthProvider } from './context/AuthContext.js';
import Web3Provider from "./context/Web3Context.js";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Web3Provider>
        <Router />
      </Web3Provider>
    </AuthProvider>
  </React.StrictMode>
);


