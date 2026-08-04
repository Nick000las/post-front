import { NavLink } from 'react-router-dom'
import { LogOut, Send, Users, Rss } from 'lucide-react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Publicar Post', icon: Send, end: true },
  { to: '/clientes', label: 'Clientes', icon: Users, end: false },
  { to: '/feed', label: 'Feed Global', icon: Rss, end: false },
]

function Sidebar({ collapsed = false }) {
  const { user, logout } = useAuth()

  return (
    <aside
      className={cn(
        'shrink-0 border-r bg-card flex flex-col h-screen sticky top-0 transition-all',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className={cn('py-5 border-b', collapsed ? 'px-2 text-center' : 'px-4')}>
        <h2 className="text-lg font-semibold text-foreground truncate">
          {collapsed ? 'AP' : 'Auto Post'}
        </h2>
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-3">
        <TooltipProvider delayDuration={200}>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => {
            const link = (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'justify-center px-0',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && label}
              </NavLink>
            )

            if (!collapsed) return link

            return (
              <Tooltip key={to}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </nav>

      <div className="border-t p-3 flex flex-col gap-2">
        {user && !collapsed && (
          <p className="px-3 text-sm text-muted-foreground truncate">{user.name}</p>
        )}
        <button
          type="button"
          onClick={logout}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && 'Sair'}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
