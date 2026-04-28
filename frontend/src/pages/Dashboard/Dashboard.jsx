import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { sanitize } from '../../utils/sanitize';
import { useAuth } from '../../context/AuthContext';
import UserBadge from '../../components/common/UserBadge';
import styles from './Dashboard.module.css';

const BADGE_OPTIONS = [
  { value: '',           label: 'Aucun badge' },
  { value: 'amateur',    label: '📷 Amateur' },
  { value: 'pro',        label: '⭐ Pro' },
  { value: 'pro_offres', label: '✅ Pro · Ouvert aux offres' },
];

const BADGE_COLORS = {
  amateur:    '#5B4CF5',
  pro:        '#d97706',
  pro_offres: '#059669',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [albums,      setAlbums]      = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [projets,     setProjets]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [badgeSaving, setBadgeSaving] = useState(false);

  const fetchAlbums = useCallback(() => {
    api.get('/portfolios/miens')
      .then((r) => {
        setAlbums(r.data);
        if (r.data.length > 0) setSelected((prev) => prev ?? r.data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);

  useEffect(() => {
    if (!selected) { setProjets([]); return; }
    api.get(`/portfolios/${selected.slug}`)
      .then((r) => setProjets(r.data.projets || []));
  }, [selected]);

  const saveBadge = async (badge) => {
    setBadgeSaving(true);
    try {
      const r = await api.patch('/auth/profile', { badge });
      if (setUser) setUser(r.data);
    } finally { setBadgeSaving(false); }
  };

  const uploadFile = async (endpoint, fieldName, file) => {
    const fd = new FormData();
    fd.append(fieldName, file);
    const r = await api.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (setUser) setUser(r.data);
  };

  const handleDeleteAlbum = async (album) => {
    if (!window.confirm(`Supprimer le portfolio "${album.titre}" et tous ses projets ?`)) return;
    await api.delete(`/portfolios/${album.slug}`);
    setAlbums((a) => {
      const next = a.filter((x) => x.slug !== album.slug);
      setSelected(next[0] ?? null);
      return next;
    });
  };

  const handleDeleteProjet = async (slug) => {
    if (!window.confirm('Supprimer ce projet ?')) return;
    await api.delete(`/projets/${slug}`);
    setProjets((p) => p.filter((pr) => pr.slug !== slug));
    setAlbums((a) => a.map((al) =>
      al.slug === selected?.slug ? { ...al, nb_projets: al.nb_projets - 1 } : al
    ));
  };

  const toggleStatut = async (projet) => {
    const newStatut = projet.statut === 'publie' ? 'brouillon' : 'publie';
    await api.patch(`/projets/${projet.slug}`, { statut: newStatut });
    setProjets((p) => p.map((pr) => pr.slug === projet.slug ? { ...pr, statut: newStatut } : pr));
  };

  if (loading) return <p className="loading">Chargement…</p>;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-7)', paddingBottom: 'var(--space-9)' }}>

      {/* Header profil */}
      <div className={styles.profileCard}>
        {/* Banniere */}
        <div className={styles.banner}>
          {user?.banniere
            ? <img src={user.banniere} alt="" className={styles.bannerImg} />
            : <div className={styles.bannerPh} />
          }
          <label className={styles.bannerEdit} title="Modifier la banniere">
            <span>🖼</span>
            <input type="file" hidden accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files[0] && uploadFile('/auth/banniere', 'banniere', e.target.files[0])} />
          </label>
        </div>

        {/* Infos profil */}
        <div className={styles.profileInfo}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatarCircle} style={(() => { const c = BADGE_COLORS[user?.badge]; return c ? { borderColor: c, boxShadow: `0 4px 20px ${c}55, 0 0 0 4px ${c}22` } : {}; })()}>
              {user?.avatar
                ? <img src={user.avatar} alt={user?.pseudo} />
                : <span>{user?.pseudo?.[0]?.toUpperCase()}</span>
              }
            </div>
            <label className={styles.avatarEdit} title="Modifier la photo de profil">
              <span>📷</span>
              <input type="file" hidden accept="image/jpeg,image/png,image/webp"
                onChange={(e) => e.target.files[0] && uploadFile('/auth/avatar', 'avatar', e.target.files[0])} />
            </label>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p className={styles.profileName}>{user?.pseudo}</p>
            <div className={styles.badgeRow}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '.8125rem' }}>Badge :</span>
              <UserBadge badge={user?.badge} size="sm" />
              <select className={styles.badgeSelect} value={user?.badge || ''}
                onChange={(e) => saveBadge(e.target.value)} disabled={badgeSaving}>
                {BADGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard/stats')}>
              &#128202; Statistiques
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/portfolio/creer')}>
              + Nouveau portfolio
            </button>
          </div>
        </div>
      </div>

      {albums.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Vous n'avez pas encore de portfolio.</p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Créez un portfolio pour y regrouper vos projets et les partager.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/portfolio/creer')}>
            Créer mon premier portfolio
          </button>
        </div>
      ) : (
        <>
          {/* Grille d'albums */}
          <div className={styles.albumGrid}>
            {albums.map((al) => (
              <button
                key={al.slug}
                className={`${styles.albumCard} ${selected?.slug === al.slug ? styles.albumActive : ''}`}
                onClick={() => setSelected(al)}
              >
                <div className={styles.albumThumb}>
                  {(al.image_couverture || al.thumbnail)
                    ? <img src={al.image_couverture || al.thumbnail} alt={sanitize(al.titre)} />
                    : <span className={styles.albumInitial}>{sanitize(al.titre)[0]}</span>
                  }
                </div>
                <div className={styles.albumInfo}>
                  <p className={styles.albumTitle}>{sanitize(al.titre)}</p>
                  <p className={styles.albumCount}>{al.nb_projets} projet{Number(al.nb_projets) !== 1 ? 's' : ''}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Contenu de l'album sélectionné */}
          {selected && (
            <div className={styles.albumContent}>
              <div className={styles.albumHeader}>
                <div>
                  <h2 className="section-title">{sanitize(selected.titre)}</h2>
                  {selected.description && (
                      <p className={styles.albumDesc}>{sanitize(selected.description)}</p>
                  )}
                </div>
                <div className={styles.albumActions}>
                  <Link
                    to={`/portfolio/${selected.slug}`}
                    className="btn btn-secondary btn-sm"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Voir public →
                  </Link>
                  <Link
                    to={`/dashboard/portfolio/creer?edit=${selected.slug}`}
                    className="btn btn-secondary btn-sm"
                  >
                    Modifier le portfolio
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteAlbum(selected)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <div className={styles.projetsHead}>
                <h3 style={{ fontWeight: 600 }}>
                  Projets ({projets.length})
                </h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/dashboard/nouveau?album=${selected.slug}`)}
                >
                  + Nouveau projet
                </button>
              </div>

              {projets.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
                  Aucun projet dans ce portfolio.
                </p>
              ) : (
                <div className={styles.list}>
                  {projets.map((p) => (
                    <div key={p.id_projet} className={styles.row}>
                      <div className={styles.rowThumb}>
                        {p.medias?.[0]
                          ? <img src={p.medias[0].url_stockage} alt="" />
                          : <span>{sanitize(p.titre)[0]}</span>
                        }
                      </div>
                      <div className={styles.rowInfo}>
                        <span className={styles.rowTitle}>{sanitize(p.titre)}</span>
                        <span className={`badge ${p.statut === 'publie' ? styles.published : styles.draft}`}>
                          {p.statut}
                        </span>
                      </div>
                      <div className={styles.rowStats}>
                        <span>♥ {p.nb_likes || 0}</span>
                        <span>👁 {p.nb_vues || 0}</span>
                      </div>
                      <div className={styles.rowActions}>
                        <Link to={`/dashboard/projet/${p.slug}`} className="btn btn-secondary btn-sm">
                          Modifier
                        </Link>
                        <button className="btn btn-secondary btn-sm" onClick={() => toggleStatut(p)}>
                          {p.statut === 'publie' ? 'Dépublier' : 'Publier'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProjet(p.slug)}>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
