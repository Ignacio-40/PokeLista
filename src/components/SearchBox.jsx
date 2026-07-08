function SearchBox({ searchTerm, onSearchChange }) {
  return (
    <label className="search-box">
      <span>Buscar Pokémon</span>
      <input
        type="text"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Ej: pikachu"
      />
    </label>
  )
}

export default SearchBox
