import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { sanitize } from '../../utils/sanitize';
import styles from './Explore.module.css';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projets,    setProjets]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);

  const q         = searchParams.get('q')         || '';
  const categorie = searchParams.get('categorie') || '';

  const fetchProjets = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (q)         params.set('q', q);
    if (categorie) params.set('categorie', categorie);
    api.get(`/projets?${params}`)
      .then((r) => setProjets(r.data.data))
      .finally(() => setLoading(false));
  }, [page, q, categorie]);

  useEffect(() => { fetchProjets(); }, [fetchProjets]);
  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data));
  }, []);

  const setFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set(key, value) : p.delete(key);
    p.delete('page');
    setPage(1);
    setSearchParams(p);
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-7)', paddingBottom: 'var(--space-9)' }}>
      <h1 className="page-title">Explorer</h1>

      {/* Barre de recherche */}
      <div className={styles.searchBar}>
        <input
          className="input"
          placeholder="Rechercher un projet…"
          defaultValue={q}
          onKeyDown={(e) => e.key === 'Enter' && setFilter('q', e.target.value)}
        />
      </div>

      {/* Filtres catégories */}
      <div className={styles.filters}>
        <button
          className={`badge ${!categorie ? styles.filterActive : ''}`}
          onClick={() => setFilter('categorie', '')}
        >Tous</button>
        {categories.map((c) => (
          <button
            key={c.id_categorie}
            className={`badge ${categorie === c.slug ? styles.filterActive : ''}`}
            onClick={() => setFilter('categorie', c.slug)}
          >{sanitize(c.nom)}</button>
        ))}
      </div>

      {/* Grille */}
      {loading ? (
        <p className="loading">Chargement…</p>
      ) : projets.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
          Aucun projet trouvé.
        </p>
      ) : (
        <div className="grid-projects">
          {projets.map((p) => (
            <Link key={p.id_projet} to={`/projet/${p.slug}`} className={`card ${styles.card}`}>
              <div className={styles.thumb}>
                {p.media
                  ? <img src={p.media} alt={sanitize(p.titre)} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:700, color:'var(--color-accent)' }}>{sanitize(p.titre)[0]}</div>
                }
              </div>
              <div className={styles.body}>
                <h3>{sanitize(p.titre)}</h3>
                <p className={styles.meta}>par {sanitize(p.pseudo)}</p>
                <div className={styles.stats}>
                  <span>♥ {p.nb_likes}</span>
                  <span>👁 {p.nb_vues}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className={styles.pagination}>
        {page > 1 && <button className="btn btn-secondary btn-sm" onClick={() => setPage(page - 1)}>← Précédent</button>}
        {projets.length === 12 && <button className="btn btn-secondary btn-sm" onClick={() => setPage(page + 1)}>Suivant →</button>}
      </div>
    </div>
  );
}
