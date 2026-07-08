function SummaryBar({ total, favorites, blocked }) {
  return (
    <div className="summary-bar" aria-label="Resumen de Pokémon">
      <div className="summary-item">
        <span className="summary-label">Total</span>
        <strong>{total}</strong>
      </div>
      <div className="summary-item">
        <span className="summary-label">Favoritos</span>
        <strong>{favorites}</strong>
      </div>
      <div className="summary-item">
        <span className="summary-label">Bloqueados</span>
        <strong>{blocked}</strong>
      </div>
    </div>
  )
}

export default SummaryBar
