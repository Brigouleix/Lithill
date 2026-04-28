import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { sanitize } from '../../utils/sanitize';
import styles from './Galerie.module.css';

export default function Galerie() {
  const [projets,  setProjets]  = useState([]);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [empty,    setEmpty]    = useState(false);

  const fetchFeed = useCallback(() => {
    setLoading(true);
    api.get(`/galerie?page=${page}&limit=12`)
      .then((r) => {
        setProjets(r.data.data);
        setEmpty(r.data.data.length === 0 && page === 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  if (loading) return <p className="loading">Chargement de votre galerie…</p>;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-7)', paddingBottom: 'var(--space-9)' }}>
      <div className={styles.head}>
        <h1 className="page-title">Ma galerie</h1>
        <p className={styles.subtitle}>Publications de vos amis et des créateurs que vous suivez</p>
      </div>

      {empty ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Votre galerie est vide pour l'instant</p>
          <p className={styles.emptyDesc}>
            Ajoutez des amis ou suivez des créateurs pour voir leurs publications ici.
          </p>
          <div className={styles.emptyActions}>
            <Link to="/amis"     className="btn btn-primary">Trouver des amis</Link>
            <Link to="/explorer" className="btn btn-secondary">Explorer les portfolios</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid-projects">
            {projets.map((p) => (
              <Link key={p.id_projet} to={`/projet/${p.slug}`} className={`card ${styles.card}`}>
                <div className={styles.thumb}>
                  {p.media
                    ? <img src={p.media} alt={sanitize(p.titre)} />
                    : <div className={styles.noImg}>{sanitize(p.titre)[0]}</div>
                  }
                </div>
                <div className={styles.body}>
                  <div className={styles.authorRow}>
                    <Link
                      to={`/portfolio/${p.portfolio_slug}`}
                      className={styles.author}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {sanitize(p.pseudo)}
                    </Link>
                    <span className={styles.date}>
                      {new Date(p.date_publication).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <h3 className={styles.title}>{sanitize(p.titre)}</h3>
                  <div className={styles.stats}>
                    <span>♥ {p.nb_likes}</span>
                    <span>👁 {p.nb_vues}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.pagination}>
            {page > 1 && (
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(page - 1)}>← Précédent</button>
            )}
            {projets.length === 12 && (
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(page + 1)}>Suivant →</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
