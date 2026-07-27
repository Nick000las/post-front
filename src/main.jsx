import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { PublishProvider } from '@/contexts/PublishContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/components/AppLayout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import AccountsManagementPage from '@/pages/AccountsManagementPage'
import DraftsPage from '@/pages/DraftsPage'
import FeedPage from '@/pages/FeedPage'
import ClientsPage from '@/pages/ClientsPage'
import ClientDashboardLayout from '@/pages/ClientDashboardLayout'
import ClientWorkflowTab from '@/pages/client/ClientWorkflowTab'
import ClientRascunhosTab from '@/pages/client/ClientRascunhosTab'
import ClientLabIaTab from '@/pages/client/ClientLabIaTab'
import ClientContasTab from '@/pages/client/ClientContasTab'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/"
              element={
                <PublishProvider>
                  <App />
                </PublishProvider>
              }
            />
            <Route path="/gerenciar-contas" element={<AccountsManagementPage />} />
            <Route path="/rascunhos" element={<DraftsPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/clientes/:clientId" element={<ClientDashboardLayout />}>
              <Route index element={<Navigate to="rascunhos" replace />} />
              <Route path="workflow" element={<ClientWorkflowTab />} />
              <Route path="rascunhos" element={<ClientRascunhosTab />} />
              <Route path="lab-ia" element={<ClientLabIaTab />} />
              <Route path="contas" element={<ClientContasTab />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster richColors position="bottom-right" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
