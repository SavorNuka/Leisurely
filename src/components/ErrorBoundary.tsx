import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Leisurely] Uncaught render error', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 text-center">
          <p className="font-serif text-2xl text-olive mb-2">Something went wrong</p>
          <p className="text-sm text-olive/60 mb-6">Reload the page to continue. Your data is safe.</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage/90 transition-colors"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
