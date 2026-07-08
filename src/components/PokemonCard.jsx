function PokemonCard({
  pokemon,
  image,
  isFavorite,
  isBlocked,
  onToggleFavorite,
  onToggleBlocked,
  fallbackImage,
}) {
  return (
    <article className="pokemon-card" key={pokemon.id}>
      <div className="card-actions">
        <button
          type="button"
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={onToggleFavorite}
          aria-label={isFavorite ? `Quitar ${pokemon.name} de favoritos` : `Agregar ${pokemon.name} a favoritos`}
        >
          {isFavorite ? '★' : '☆'}
        </button>
        <button
          type="button"
          className={`block-button ${isBlocked ? 'active' : ''}`}
          onClick={onToggleBlocked}
          aria-label={isBlocked ? `Desbloquear ${pokemon.name}` : `Bloquear ${pokemon.name}`}
        >
          {isBlocked ? '🔓' : '🚫'}
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
}

export default PokemonCard
