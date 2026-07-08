import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PasswordInput from '@/components/PasswordInput'
import { useAuth } from '@/contexts/AuthContext'
import { validateLoginForm } from '@/lib/validators'

function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState(location.state?.email ?? '')
  const [password, setPassword] = useState('')

  const isLoading = status === 'loading'

  useEffect(() => {
    if (status === 'success') {
      navigate('/', { replace: true })
    }
  }, [status, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationError = validateLoginForm({ email, password })
    if (validationError) {
      toast.error(validationError)
      return
    }
    login(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Entrar</h1>
          <p className="text-muted-foreground mt-1">
            Acesse sua conta para publicar posts.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="voce@exemplo.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="password">Senha</Label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full h-11 text-base mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                Entrando...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4 shrink-0" />
                Entrar
              </>
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-primary underline-offset-4 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
