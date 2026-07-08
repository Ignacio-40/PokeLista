import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPokemons = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20')

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

      {loading && <p className="status">Cargando Pokémon...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <section className="pokemon-grid" aria-label="Listado de Pokémon">
          {pokemonList.map((pokemon) => {
            const image =
              pokemon.sprites?.other?.['official-artwork']?.front_default ||
              pokemon.sprites?.front_default

            return (
              <article className="pokemon-card" key={pokemon.id}>
                <img
                  src={image}
                  alt={pokemon.name}
                  className="pokemon-image"
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
