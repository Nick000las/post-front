import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import ClientRail from '@/components/ClientRail'

function AppLayout() {
  const { pathname } = useLocation()
  // Colapsa a sidebar e mostra a rail apenas dentro do dashboard de um
  // cliente específico (/clientes/:clientId/...) — a lista geral (/clientes)
  // continua com o layout normal.
  const isClientDetailArea = /^\/clientes\/[^/]+/.test(pathname)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={isClientDetailArea} />
      {isClientDetailArea && <ClientRail />}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
