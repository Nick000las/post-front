import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from '@/components/ui/sonner'
import { PublishProvider } from '@/contexts/PublishContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PublishProvider>
      <App />
    </PublishProvider>
    <Toaster richColors position="bottom-right" />
  </React.StrictMode>
)
