import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [favorites, setFavorites] = useState(() => {
    const storedFavorites = window.localStorage.getItem('pokemon-favorites')
    return storedFavorites ? JSON.parse(storedFavorites) : []
  })
  const [blockedPokemons, setBlockedPokemons] = useState(() => {
    const storedBlocked = window.localStorage.getItem('pokemon-blocked')
    return storedBlocked ? JSON.parse(storedBlocked) : []
  })

  useEffect(() => {
    window.localStorage.setItem('pokemon-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    window.localStorage.setItem('pokemon-blocked', JSON.stringify(blockedPokemons))
  }, [blockedPokemons])

  useEffect(() => {
    const loadPokemons = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=40')

        if (!response.ok) {
          throw new Error('No se pudo cargar la lista de Pokémon')
        }

        const data = await response.json()
        const detailedPokemons = await Promise.all(
          data.results.map(async (pokemon) => {
            const detailResponse = await fetch(pokemon.url)

            if (!detailResponse.ok) {
              throw new Error(`No se pudo cargar ${pokemon.name}`)
            }

            return detailResponse.json()
          }),
        )

        setPokemonList(detailedPokemons)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPokemons()
  }, [])

  const filteredPokemons = pokemonList.filter(
    (pokemon) =>
      !blockedPokemons.some((blocked) => blocked.id === pokemon.id) &&
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const fallbackImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <rect width="256" height="256" rx="24" fill="#f3f4f6"/>
      <circle cx="128" cy="128" r="72" fill="#d1d5db"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">Sin imagen</text>
    </svg>
  `)}`

  const getPokemonImage = (pokemon) => {
    const candidates = [
      pokemon.sprites?.other?.['official-artwork']?.front_default,
      pokemon.sprites?.other?.home?.front_default,
      pokemon.sprites?.other?.dream_world?.front_default,
      pokemon.sprites?.front_default,
    ]

    return candidates.find(Boolean) || fallbackImage
  }

  const toggleFavorite = (pokemon) => {
    setFavorites((currentFavorites) => {
      const exists = currentFavorites.some((favorite) => favorite.id === pokemon.id)

      if (exists) {
        return currentFavorites.filter((favorite) => favorite.id !== pokemon.id)
      }

      return [...currentFavorites, pokemon]
    })
  }

  const toggleBlocked = (pokemon) => {
    setBlockedPokemons((currentBlocked) => {
      const exists = currentBlocked.some((blocked) => blocked.id === pokemon.id)

      if (exists) {
        return currentBlocked.filter((blocked) => blocked.id !== pokemon.id)
      }

      return [...currentBlocked, pokemon]
    })

    setFavorites((currentFavorites) =>
      currentFavorites.filter((favorite) => favorite.id !== pokemon.id),
    )
  }

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Pokédex</p>
          <h1>Explora Pokémon desde la PokeAPI</h1>
          <p className="hero-text">
            Aquí puedes ver una lista de Pokémon con su nombre, número y una imagen oficial.
          </p>
        </div>
      </section>

      {!loading && !error && (
        <>
          <label className="search-box">
            <span>Buscar Pokémon</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ej: pikachu"
            />
          </label>

          <div className="summary-bar" aria-label="Resumen de Pokémon">
            <div className="summary-item">
              <span className="summary-label">Total</span>
              <strong>{pokemonList.length}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Favoritos</span>
              <strong>{favorites.length}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Bloqueados</span>
              <strong>{blockedPokemons.length}</strong>
            </div>
          </div>
        </>
      )}

      {loading && <p className="status">Cargando Pokémon...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <div className="content-layout">
          <section className="pokemon-grid" aria-label="Listado de Pokémon">
            {filteredPokemons.map((pokemon) => {
              const image = getPokemonImage(pokemon)
              const isFavorite = favorites.some((favorite) => favorite.id === pokemon.id)

              return (
                <article className="pokemon-card" key={pokemon.id}>
                  <div className="card-actions">
                    <button
                      type="button"
                      className={`favorite-button ${isFavorite ? 'active' : ''}`}
                      onClick={() => toggleFavorite(pokemon)}
                      aria-label={isFavorite ? `Quitar ${pokemon.name} de favoritos` : `Agregar ${pokemon.name} a favoritos`}
                    >
                      {isFavorite ? '★' : '☆'}
                    </button>
                    <button
                      type="button"
                      className={`block-button ${blockedPokemons.some((blocked) => blocked.id === pokemon.id) ? 'active' : ''}`}
                      onClick={() => toggleBlocked(pokemon)}
                      aria-label={blockedPokemons.some((blocked) => blocked.id === pokemon.id) ? `Desbloquear ${pokemon.name}` : `Bloquear ${pokemon.name}`}
                    >
                      {blockedPokemons.some((blocked) => blocked.id === pokemon.id) ? '🔓' : '🚫'}
                    </button>
                  </div>
                  <img
                    src={image}
                    alt={pokemon.name}
                    className="pokemon-image"
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage
                    }}
                  />
                  <div className="pokemon-info">
                    <p className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</p>
                    <h2>{pokemon.name}</h2>
                    <p className="pokemon-types">
                      {pokemon.types.map((type) => type.type.name).join(' • ')}
                    </p>
                  </div>
                </article>
              )
            })}
          </section>

          <aside className="favorites-panel">
            <section className="panel-section">
              <h2>Favoritos</h2>
              {favorites.length === 0 ? (
                <p className="favorites-empty">Aún no has marcado favoritos.</p>
              ) : (
                <ul className="favorites-list">
                  {favorites.map((pokemon) => {
                    const image = getPokemonImage(pokemon)

                    return (
                      <li key={pokemon.id} className="favorite-item">
                        <div className="favorite-item-content">
                          <img
                            src={image}
                            alt={pokemon.name}
                            className="favorite-thumb"
                            onError={(event) => {
                              event.currentTarget.src = fallbackImage
                            }}
                          />
                          <span>{pokemon.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(pokemon)}
                          aria-label={`Quitar ${pokemon.name} de favoritos`}
                        >
                          ✕
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <section className="panel-section">
              <h2>Bloqueados</h2>
              {blockedPokemons.length === 0 ? (
                <p className="favorites-empty">No hay Pokémon bloqueados.</p>
              ) : (
                <ul className="favorites-list">
                  {blockedPokemons.map((pokemon) => (
                    <li key={pokemon.id} className="favorite-item blocked-item">
                      <span>{pokemon.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleBlocked(pokemon)}
                        aria-label={`Desbloquear ${pokemon.name}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      )}
    </main>
  )
}

export default App
