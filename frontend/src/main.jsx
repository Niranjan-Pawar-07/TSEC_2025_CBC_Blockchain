import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Sepolia } from "@thirdweb-dev/chains";
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThirdwebProvider 
      clientId="6aeaf8cb4735acb437831512923c95be"
      activeChain={Sepolia}
    >
      <App />
    </ThirdwebProvider>
  </React.StrictMode>
);