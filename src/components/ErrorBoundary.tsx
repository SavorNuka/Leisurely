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

  handleClearAndReload = () => {
    try {
      localStorage.clear()
      indexedDB.deleteDatabase('leisurely-db')
    } catch (_) {}
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 text-center">
          <p className="font-serif text-2xl text-olive mb-2">Something went wrong</p>
          <p className="text-sm text-olive/60 mb-4">Reload the page to continue. If the error persists, clearing local data will fix it.</p>
          <pre className="mb-6 max-w-lg w-full text-left bg-white/70 rounded-lg p-3 text-xs text-red-700 overflow-x-auto whitespace-pre-wrap break-words border border-red-200">
            {this.state.error.message}
            {'\n'}
            {this.state.error.stack}
          </pre>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage/90 transition-colors"
            >
              Reload
            </button>
            <button
              onClick={this.handleClearAndReload}
              className="text-xs text-olive/40 underline underline-offset-2"
            >
              Clear local data and reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
