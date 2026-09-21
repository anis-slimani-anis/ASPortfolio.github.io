/* Shown when a mode has no journeys, e.g. Bus ou covoiturage on this route.
   Artwork is "Oops Vector", node 622:15211, used as exported. */
export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="empty">
      <h2 className="empty__title">Aucun trajet trouvé</h2>
      <p className="empty__sub">
        Essayez de modifier votre recherche : lieu de départ ou d’arrivée, horaire…
      </p>
      <img
        className="empty__art"
        src={`${import.meta.env.BASE_URL}empty/oops.svg`}
        alt=""
        width={573}
        height={151}
      />
      <button type="button" className="pill pill--primary" onClick={onReset}>
        Modifier votre recherche
      </button>
    </div>
  )
}
