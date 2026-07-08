import { useEffect, useState } from 'react'
import './App.css'
import HeroSection from './components/HeroSection'
import SearchBox from './components/SearchBox'
import SummaryBar from './components/SummaryBar'
import PokemonCard from './components/PokemonCard'
import FavoritesPanel from './components/FavoritesPanel'
import useLocalStorage from './hooks/useLocalStorage'

function App() {
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [favorites, setFavorites] = useLocalStorage('pokemon-favorites', [])
  const [blockedPokemons, setBlockedPokemons] = useLocalStorage('pokemon-blocked', [])

  useEffect(() => {
    const loadPokemons = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')

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
      pokemon.sprites?.other?.['official-artwork']?.front_shiny,
      pokemon.sprites?.other?.home?.front_default,
      pokemon.sprites?.other?.home?.front_shiny,
      pokemon.sprites?.other?.dream_world?.front_default,
      pokemon.sprites?.other?.showdown?.front_default,
      pokemon.sprites?.other?.showdown?.front_shiny,
      pokemon.sprites?.front_default,
      pokemon.sprites?.front_shiny,
      pokemon.sprites?.back_default,
      pokemon.sprites?.back_shiny,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
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
      <HeroSection />

      {!loading && !error && (
        <>
          <SearchBox
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <SummaryBar
            total={pokemonList.length}
            favorites={favorites.length}
            blocked={blockedPokemons.length}
          />
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
              const isBlocked = blockedPokemons.some((blocked) => blocked.id === pokemon.id)

              return (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  image={image}
                  isFavorite={isFavorite}
                  isBlocked={isBlocked}
                  onToggleFavorite={() => toggleFavorite(pokemon)}
                  onToggleBlocked={() => toggleBlocked(pokemon)}
                  fallbackImage={fallbackImage}
                />
              )
            })}
          </section>

          <FavoritesPanel
            favorites={favorites}
            blockedPokemons={blockedPokemons}
            onToggleFavorite={toggleFavorite}
            onToggleBlocked={toggleBlocked}
            getPokemonImage={getPokemonImage}
            fallbackImage={fallbackImage}
          />
        </div>
      )}
    </main>
  )
}

export default App
