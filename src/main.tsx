import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StripeProvider } from './contexts/StripeContext'

createRoot(document.getElementById("root")!).render(
  <StripeProvider>
    <App />
  </StripeProvider>
);
