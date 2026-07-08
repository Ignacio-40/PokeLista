function FavoritesPanel({ favorites, blockedPokemons, onToggleFavorite, onToggleBlocked, getPokemonImage, fallbackImage }) {
  return (
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
                    onClick={() => onToggleFavorite(pokemon)}
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
                  onClick={() => onToggleBlocked(pokemon)}
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
  )
}

export default FavoritesPanel
