import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { sanitize } from '../../utils/sanitize';
import { useAuth } from '../../context/AuthContext';
import UserBadge from '../../components/common/UserBadge';
import Error404 from '../Error/Error404';
import styles from './Projet.module.css';

const BADGE_COLORS = {
  amateur:    '#5B4CF5',
  pro:        '#d97706',
  pro_offres: '#059669',
};

const REACTIONS = [
  { type: 'like',    emoji: '❤️', label: "J'aime" },
  { type: 'spot',    emoji: '💡',       label: 'Lumiere' },
  { type: 'palette', emoji: '🎨', label: 'Couleurs' },
  { type: 'lieu',    emoji: '📸', label: 'Lieu' },
];

export default function Projet() {
  const { slug }   = useParams();
  const { user }   = useAuth();
  const [projet,   setProjet]  = useState(null);
  const [current,  setCurrent] = useState(0);
  const [loading,  setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/projets/${slug}`)
      .then((r) => { setProjet(r.data); setCurrent(0); })
      .catch((e) => { if (e.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [slug]);

  const navigate = useCallback((dir) => {
    if (!projet) return;
    setCurrent((c) => (c + dir + projet.medias.length) % projet.medias.length);
  }, [projet]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  const toggleReaction = async (mediaId, type) => {
    if (!user) return;
    try {
      await api.post(`/medias/${mediaId}/react`, { type });
      setProjet((p) => ({
        ...p,
        medias: p.medias.map((m) => {
          if (m.id_media !== mediaId) return m;
          const had = (m.user_reactions || []).includes(type);
          return {
            ...m,
            reactions: { ...m.reactions, [type]: (m.reactions[type] || 0) + (had ? -1 : 1) },
            user_reactions: had
              ? m.user_reactions.filter((r) => r !== type)
              : [...(m.user_reactions || []), type],
          };
        }),
      }));
    } catch (_) {}
  };

  if (loading)  return <p className="loading">Chargement...</p>;
  if (notFound) return <Error404 />;

  const { titre, description, medias = [], tags = [], categories = [], nb_vues, pseudo, avatar, portfolio_slug, badge } = projet;
  const media = medias[current];

  return (
    <div className="container" style={{ paddingTop: 'var(--space-7)', paddingBottom: 'var(--space-9)' }}>
      <div className={styles.layout}>

        {/* Galerie */}
        <div className={styles.gallery}>
          {medias.length > 0 ? (
            <>
              {/* Image principale + zones de clic + fleches */}
              <div className={styles.mainWrap}>
                <img
                  key={media.id_media}
                  src={media.url_stockage}
                  alt={sanitize(titre)}
                  className={styles.mainImage}
                />
                {medias.length > 1 && (
                  <>
                    <div className={`${styles.clickZone} ${styles.clickZoneL}`} onClick={() => navigate(-1)} />
                    <div className={`${styles.clickZone} ${styles.clickZoneR}`} onClick={() => navigate(1)} />
                    <button className={`${styles.arrow} ${styles.arrowL}`} onClick={() => navigate(-1)} aria-label="Precedent">
                      &#8249;
                    </button>
                    <button className={`${styles.arrow} ${styles.arrowR}`} onClick={() => navigate(1)} aria-label="Suivant">
                      &#8250;
                    </button>
                    <div className={styles.counter}>{current + 1} / {medias.length}</div>
                  </>
                )}
              </div>

              {/* Reactions */}
              <div className={styles.reactions}>
                {REACTIONS.map(({ type, emoji, label }) => {
                  const active = (media.user_reactions || []).includes(type);
                  return (
                    <button
                      key={type}
                      className={`${styles.reactionBtn} ${active ? styles.reactionActive : ''}`}
                      onClick={() => toggleReaction(media.id_media, type)}
                      disabled={!user}
                      title={user ? label : 'Connectez-vous pour reagir'}
                    >
                      <span className={styles.reactionEmoji}>{emoji}</span>
                      <span className={styles.reactionCount}>{media.reactions?.[type] || 0}</span>
                    </button>
                  );
                })}
              </div>

              {/* Strip de thumbnails */}
              {medias.length > 1 && (
                <div className={styles.thumbStrip}>
                  {medias.map((m, i) => (
                    <button
                      key={m.id_media}
                      className={`${styles.thumb} ${i === current ? styles.thumbActive : ''}`}
                      onClick={() => setCurrent(i)}
                    >
                      <img src={m.url_stockage} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.noMedia}>Aucun media</div>
          )}
        </div>

        {/* Sidebar info */}
        <aside className={styles.aside}>
          <h1 className={styles.title}>{sanitize(titre)}</h1>

          <div className={styles.authorRow}>
            <div
              className={styles.authorAvatar}
              style={(() => { const c = BADGE_COLORS[badge]; return c ? { borderColor: c, boxShadow: `0 3px 14px ${c}55, 0 0 0 3px ${c}22` } : {}; })()}
            >
              {avatar
                ? <img src={avatar} alt={sanitize(pseudo)} />
                : <span>{sanitize(pseudo)?.[0]?.toUpperCase()}</span>
              }
            </div>
            <Link to={`/portfolio/${portfolio_slug}`} className={styles.author}>
              {sanitize(pseudo)}
            </Link>
            <UserBadge badge={badge} />
          </div>

          <p className={styles.views}>&#128065; {nb_vues} vues</p>

          {description && (
            <p className={styles.desc}>{sanitize(description)}</p>
          )}

          {categories.length > 0 && (
            <div className={styles.tags}>
              {categories.map((c) => (
                <span key={c.id_categorie} className="badge">{sanitize(c.nom)}</span>
              ))}
            </div>
          )}

          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((t) => (
                <span key={t.id_tag} className={`badge ${styles.tagMuted}`}>
                  {sanitize(t.nom)}
                </span>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
