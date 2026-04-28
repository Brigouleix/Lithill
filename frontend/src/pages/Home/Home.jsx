import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { sanitize } from '../../utils/sanitize';
import styles from './Home.module.css';

export default function Home() {
  const [projets,    setProjets]    = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/projets?limit=6'),
      api.get('/portfolios?limit=4'),
    ])
      .then(([p, po]) => {
        setProjets(p.data.data);
        setPortfolios(po.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            Découvrez les créations<br />des amateurs talentueux
          </h1>
          <p className={styles.heroSub}>
            Lithill réunit photographes, illustrateurs, développeurs et artistes
            dans un espace dédié à la création amateur.
          </p>
          <div className={styles.heroActions}>
            <Link to="/explorer"   className="btn btn-primary">Explorer les portfolios</Link>
            <Link to="/inscription" className="btn btn-secondary">Créer mon portfolio</Link>
          </div>
        </div>
      </section>

      {/* Projets récents */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className="section-title">Projets récents</h2>
            <Link to="/explorer" className={styles.seeAll}>Voir tout →</Link>
          </div>
          {loading ? (
            <p className="loading">Chargement…</p>
          ) : (
            <div className="grid-projects">
              {projets.map((p) => (
                <Link key={p.id_projet} to={`/projet/${p.slug}`} className={`card ${styles.projectCard}`}>
                  {p.medias?.[0] && (
                    <img src={p.medias[0].url_stockage} alt={sanitize(p.titre)} className={styles.thumb} />
                  )}
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{sanitize(p.titre)}</h3>
                    <p className={styles.cardMeta}>par {sanitize(p.pseudo)}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.stat}>♥ {p.nb_likes}</span>
                      <span className={styles.stat}>👁 {p.nb_vues}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Portfolios mis en avant */}
      <section className={`${styles.section} ${styles.bgLight}`}>
        <div className="container">
          <h2 className="section-title">Créateurs à découvrir</h2>
          <div className={styles.portfolioGrid}>
            {portfolios.map((po) => (
              <Link key={po.id_portfolio} to={`/portfolio/${po.slug}`} className={`card ${styles.portfolioCard}`}>
                <div className={styles.portfolioAvatar}>
                  {po.avatar
                    ? <img src={po.avatar} alt={sanitize(po.pseudo)} className="avatar" width={56} height={56} />
                    : <div className={styles.avatarPlaceholder}>{po.pseudo[0].toUpperCase()}</div>
                  }
                </div>
                <div>
                  <p className={styles.portfolioName}>{sanitize(po.pseudo)}</p>
                  <p className={styles.portfolioCount}>{po.nb_projets} projet{po.nb_projets > 1 ? 's' : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
