import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from "@/components/ui/toaster"
import { HelmetProvider } from 'react-helmet-async';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <Toaster />
    </HelmetProvider>
  </React.StrictMode>,
)
