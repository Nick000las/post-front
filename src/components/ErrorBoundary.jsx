import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Sem isto, um erro de render em qualquer ponto da árvore (Kanban, Feed,
// Lab IA etc.) derruba a SPA inteira pra tela branca, sem nada visível pro
// usuário nem registro do que aconteceu.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro não tratado na aplicação:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold text-foreground">Algo deu errado</h1>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
          </div>
          <Button onClick={this.handleReload}>Recarregar</Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
