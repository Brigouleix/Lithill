import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { sanitize } from '../../utils/sanitize';
import styles from './Stats.module.css';

const REACTIONS = [
  { type: 'like',    key: 'r_like',    emoji: '❤️',  label: 'Like' },
  { type: 'spot',    key: 'r_spot',    emoji: '💡',  label: 'Lumiere' },
  { type: 'palette', key: 'r_palette', emoji: '🎨',  label: 'Couleurs' },
  { type: 'lieu',    key: 'r_lieu',    emoji: '📸',  label: 'Lieu' },
];

const SORT_OPTIONS = [
  { value: 'date_desc',      label: 'Date (recent)' },
  { value: 'date_asc',       label: 'Date (ancien)' },
  { value: 'vues_desc',      label: 'Vues (max)' },
  { value: 'reactions_desc', label: 'Reactions (max)' },
  { value: 'like_desc',      label: 'Like (max)' },
  { value: 'spot_desc',      label: 'Lumiere (max)' },
  { value: 'palette_desc',   label: 'Couleurs (max)' },
  { value: 'lieu_desc',      label: 'Lieu (max)' },
];

export default function Stats() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort,    setSort]    = useState('date_desc');

  useEffect(() => {
    api.get('/mes-stats')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    if (!data?.projets) return [];
    const arr = [...data.projets];
    switch (sort) {
      case 'date_asc':       return arr.sort((a, b) => new Date(a.date_creation) - new Date(b.date_creation));
      case 'vues_desc':      return arr.sort((a, b) => b.nb_vues    - a.nb_vues);
      case 'reactions_desc': return arr.sort((a, b) => b.r_total    - a.r_total);
      case 'like_desc':      return arr.sort((a, b) => b.r_like     - a.r_like);
      case 'spot_desc':      return arr.sort((a, b) => b.r_spot     - a.r_spot);
      case 'palette_desc':   return arr.sort((a, b) => b.r_palette  - a.r_palette);
      case 'lieu_desc':      return arr.sort((a, b) => b.r_lieu     - a.r_lieu);
      default:               return arr.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
    }
  }, [data, sort]);

  if (loading) return <p className="loading">Chargement...</p>;

  const { global: g, reactions_global: rg = {} } = data;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-7)', paddingBottom: 'var(--space-9)' }}>

      <div className={styles.pageHead}>
        <div>
          <h1 className="page-title">Mes statistiques</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
            Analyse de l'engagement sur vos publications
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-secondary btn-sm">&#8592; Tableau de bord</Link>
      </div>

      {/* Global summary cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>&#128444;</span>
          <div>
            <p className={styles.summaryValue}>{g.nb_projets}</p>
            <p className={styles.summaryLabel}>Projets</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>&#128065;</span>
          <div>
            <p className={styles.summaryValue}>{g.nb_vues.toLocaleString()}</p>
            <p className={styles.summaryLabel}>Vues totales</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>&#10024;</span>
          <div>
            <p className={styles.summaryValue}>{g.nb_reactions.toLocaleString()}</p>
            <p className={styles.summaryLabel}>Reactions totales</p>
          </div>
        </div>
        {REACTIONS.map(({ type, emoji, label }) => (
          <div key={type} className={styles.summaryCard}>
            <span className={styles.summaryIcon}>{emoji}</span>
            <div>
              <p className={styles.summaryValue}>{(rg[type] || 0).toLocaleString()}</p>
              <p className={styles.summaryLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Per-project table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <h2 style={{ fontWeight: 600, fontSize: '1.125rem' }}>Detail par projet</h2>
          <select className={styles.sortSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {sorted.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', padding: 'var(--space-5)' }}>
            Aucun projet pour l'instant.
          </p>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Projet</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Vues</th>
                  {REACTIONS.map(({ key, emoji }) => <th key={key}>{emoji}</th>)}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id_projet}>
                    <td>
                      <div className={styles.projCell}>
                        <div className={styles.projThumb}>
                          {p.thumbnail
                            ? <img src={p.thumbnail} alt="" />
                            : <span>{sanitize(p.titre)[0]}</span>
                          }
                        </div>
                        <Link to={`/projet/${p.slug}`} className={styles.projTitle}>
                          {sanitize(p.titre)}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.statut === 'publie' ? styles.published : styles.draft}`}>
                        {p.statut}
                      </span>
                    </td>
                    <td className={styles.muted}>
                      {new Date(p.date_creation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className={styles.num}>{p.nb_vues.toLocaleString()}</td>
                    <td className={styles.num}>{p.r_like}</td>
                    <td className={styles.num}>{p.r_spot}</td>
                    <td className={styles.num}>{p.r_palette}</td>
                    <td className={styles.num}>{p.r_lieu}</td>
                    <td className={`${styles.num} ${styles.total}`}>{p.r_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
