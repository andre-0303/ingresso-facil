import { useState, useEffect } from 'react'
import type { Show } from '../types'
import { api } from '../api'
import { ShowCard } from '../components/ShowCard'
import { BuyModal } from '../components/BuyModal'
import { EditShowModal } from '../components/EditShowModal'

interface Props {
  onAdminClick: () => void
  isAdmin: boolean
}

export function Home({ onAdminClick, isAdmin }: Props) {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Show | null>(null)
  const [editing, setEditing] = useState<Show | null>(null)

  function load() {
    setLoading(true)
    api.shows.list()
      .then(setShows)
      .catch(e => setError(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function handleClose() {
    setSelected(null)
    load()
  }

  return (
    <>
      {/* Hero */}
      <div className="mb-12 anim-fade-up">
        <p className="font-mono text-xs text-accent uppercase tracking-[0.2em] mb-3">
          Eventos disponíveis
        </p>
        <h1 className="font-display text-[clamp(4rem,12vw,9rem)] leading-none tracking-tight text-[var(--text)]">
          SHOWS
        </h1>
        {!loading && shows.length > 0 && (
          <p className="text-[var(--muted)] mt-3 text-sm font-mono">
            <span className="text-accent">{shows.length}</span>{' '}
            {shows.length === 1 ? 'show disponível' : 'shows no cartaz'}
          </p>
        )}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-52 rounded-lg skeleton" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl font-mono text-danger text-sm">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && shows.length === 0 && (
        <div className="py-28 flex flex-col items-center text-center gap-5">
          <div className="font-display text-[6rem] leading-none text-[var(--border)] select-none">
            VAZIO
          </div>
          <p className="text-[var(--muted)] font-mono text-sm max-w-xs">
            Nenhum show cadastrado ainda. Crie o primeiro pela área de administração.
          </p>
          <button
            onClick={onAdminClick}
            className="px-6 py-2.5 bg-accent text-[#080808] font-semibold rounded-lg hover:bg-accent-d active:scale-95 transition-all text-sm"
          >
            Criar primeiro show
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && shows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shows.map((show, i) => (
            <ShowCard
              key={show.id}
              show={show}
              onBuy={() => setSelected(show)}
              onEdit={() => setEditing(show)}
              isAdmin={isAdmin}
              style={{ animationDelay: `${i * 0.07}s` }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selected && <BuyModal show={selected} onClose={handleClose} />}
      {editing && (
        <EditShowModal
          show={editing}
          onClose={updated => {
            setEditing(null)
            if (updated) {
              setShows(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s))
            }
          }}
        />
      )}
    </>
  )
}
