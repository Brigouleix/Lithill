import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { sanitize } from '../../utils/sanitize';
import UserBadge from '../../components/common/UserBadge';
import Error404 from '../Error/Error404';
import styles from './Portfolio.module.css';

export default function Portfolio() {
  const { slug }  = useParams();
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/portfolios/${slug}`)
      .then((r) => setData(r.data))
      .catch((e) => { if (e.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)  return <p className="loading">Chargement...</p>;
  if (notFound) return <Error404 />;

  const { pseudo, avatar, bio, badge, banniere, titre, description, projets = [] } = data;

  return (
    <>
      {/* Banniere pleine largeur */}
      <div className={styles.bannerSection}>
        {banniere
          ? <img src={banniere} alt="" className={styles.bannerImg} />
          : <div className={styles.bannerPh} />
        }
      </div>

      <div className="container" style={{ paddingBottom: 'var(--space-9)' }}>
        {/* Bloc profil */}
        <div className={styles.profileBlock}>
          <div className={styles.avatarWrap}>
            {avatar
              ? <img src={avatar} alt={sanitize(pseudo)} className={styles.avatar} />
              : <div className={styles.avatarPh}>{pseudo[0].toUpperCase()}</div>
            }
          </div>
          <div className={styles.profileMeta}>
            <div className={styles.nameRow}>
              <h1 className={styles.pseudo}>{sanitize(pseudo)}</h1>
              <UserBadge badge={badge} size="sm" />
            </div>
            <p className={styles.portfolioTitle}>{sanitize(titre)}</p>
            {bio && <p className={styles.bio}>{sanitize(bio)}</p>}
          </div>
        </div>

        {description && <p className={styles.desc}>{sanitize(description)}</p>}

        <h2 className="section-title" style={{ marginTop: 'var(--space-7)' }}>
          Projets ({projets.length})
        </h2>

        {projets.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Aucun projet publie pour l'instant.</p>
        ) : (
          <div className="grid-projects">
            {projets.map((p) => (
              <Link key={p.id_projet} to={`/projet/${p.slug}`} className={`card ${styles.card}`}>
                <div className={styles.thumb}>
                  {p.medias?.[0]
                    ? <img src={p.medias[0].url_stockage} alt={sanitize(p.titre)} />
                    : <div className={styles.noImg}>{sanitize(p.titre)[0]}</div>
                  }
                </div>
                <div className={styles.body}>
                  <h3>{sanitize(p.titre)}</h3>
                  <div className={styles.stats}>
                    <span>&#9829; {p.nb_likes}</span>
                    <span>&#128065; {p.nb_vues}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
