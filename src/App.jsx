import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredPokemons = pokemonList.filter((pokemon) =>
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
        <label className="search-box">
          <span>Buscar Pokémon</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Ej: pikachu"
          />
        </label>
      )}

      {loading && <p className="status">Cargando Pokémon...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <section className="pokemon-grid" aria-label="Listado de Pokémon">
          {filteredPokemons.map((pokemon) => {
            const image = getPokemonImage(pokemon)

            return (
              <article className="pokemon-card" key={pokemon.id}>
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
      )}
    </main>
  )
}

export default App
