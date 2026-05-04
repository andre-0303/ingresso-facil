import { useState, useEffect, type ReactNode } from 'react'
import { Home } from './pages/Home'
import { Admin } from './pages/Admin'
import { Login } from './pages/Login'

type Page = 'home' | 'admin' | 'login'
type Theme = 'dark' | 'light'

export function App() {
  const [page, setPage] = useState<Page>('home')
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('admin') === '1')
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme | null) ?? 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }

  function handleAdminClick() {
    if (isAdmin) setPage('admin')
    else setPage('login')
  }

  function handleLoginSuccess() {
    setIsAdmin(true)
    setPage('admin')
  }

  function handleLogout() {
    localStorage.removeItem('admin')
    setIsAdmin(false)
    setPage('home')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40 border-b border-[var(--border)] backdrop-blur-md"
        style={{ background: 'var(--header-bg)' }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setPage('home')}
            className="font-display text-2xl tracking-[0.15em] text-accent transition-opacity hover:opacity-80"
          >
            INGRESSO<span className="text-[var(--text)]">S</span>
          </button>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <NavBtn active={page === 'home'} onClick={() => setPage('home')}>
              Shows
            </NavBtn>

            {isAdmin ? (
              <>
                <NavBtn active={page === 'admin'} onClick={() => setPage('admin')}>
                  Admin
                </NavBtn>
                <button
                  onClick={handleLogout}
                  title="Sair"
                  className="px-3 py-1.5 text-sm font-medium rounded-lg text-danger/70 hover:text-danger hover:bg-danger/10 transition-all"
                >
                  Sair
                </button>
              </>
            ) : (
              <NavBtn active={page === 'login'} onClick={handleAdminClick}>
                Entrar
              </NavBtn>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
              title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
              className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors text-base"
            >
              {theme === 'dark' ? '☀' : '◗'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {page === 'home' && (
          <Home onAdminClick={handleAdminClick} isAdmin={isAdmin} />
        )}
        {page === 'admin' && isAdmin && (
          <Admin onBack={() => setPage('home')} />
        )}
        {page === 'login' && (
          <Login onSuccess={handleLoginSuccess} onBack={() => setPage('home')} />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] mt-20 py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <span className="font-mono text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} Venda de Ingressos
          </span>
          {isAdmin && (
            <span className="font-mono text-[10px] text-accent/50 uppercase tracking-widest">
              Admin
            </span>
          )}
        </div>
      </footer>
    </div>
  )
}

function NavBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
        active
          ? 'bg-accent text-[#080808]'
          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
