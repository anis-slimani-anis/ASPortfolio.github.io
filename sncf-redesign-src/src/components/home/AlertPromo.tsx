/* Alert D / Alert M, nodes 622:14232 / 622:14771.
   The notification opt-in: the same proactive idea the case study argues for,
   sitting on the home screen before anything has gone wrong. */
export function AlertPromo() {
  return (
    <section className="apromo" aria-labelledby="apromo-title">
      <div className="apromo__media">
        <img src={`${import.meta.env.BASE_URL}home/alerte.webp`} alt="" loading="lazy" width={750} height={490} />
      </div>
      <div className="apromo__panel">
        <h2 id="apromo-title" className="apromo__title">Premier alerté, premier servi !</h2>
        <p className="apromo__body">
          Un voyage de prévu mais les billets ne sont pas encore disponibles ? Créez une alerte,
          on vous prévient quand ils sont mis en vente.
        </p>
        <a className="apromo__link" href="#">Je crée une alerte<span aria-hidden="true"> ↗</span></a>
        <p className="apromo__body">
          Retrouvez tous nos conseils, astuces et infos utiles pour anticiper et gérer tous vos déplacements.
        </p>
        <a className="apromo__link apromo__link--sm" href="#">
          C’est parti<span className="bullet" aria-hidden="true">›</span>
        </a>
      </div>
    </section>
  )
}
