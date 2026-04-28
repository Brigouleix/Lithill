import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { sanitize } from '../../utils/sanitize';
import UserBadge from '../../components/common/UserBadge';
import styles from './Amis.module.css';

export default function Amis() {
  const [tab,       setTab]       = useState('amis');   // amis | recherche | demandes
  const [amis,      setAmis]      = useState([]);
  const [demandes,  setDemandes]  = useState([]);
  const [resultats, setResultats] = useState([]);
  const [query,     setQuery]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const fetchAmis = useCallback(() => {
    api.get('/amis').then((r) => setAmis(r.data));
    api.get('/amis/demandes').then((r) => setDemandes(r.data));
  }, []);

  useEffect(() => { fetchAmis(); }, [fetchAmis]);

  const rechercher = async (e) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true);
    const r = await api.get(`/amis/recherche?q=${encodeURIComponent(query)}`);
    setResultats(r.data);
    setTab('recherche');
    setLoading(false);
  };

  const envoyer = async (id) => {
    await api.post('/amis', { id_utilisateur: id });
    setResultats((r) => r.map((u) => u.id_utilisateur === id ? { ...u, relation: 'demande_envoyee' } : u));
  };

  const repondre = async (id, statut) => {
    await api.patch(`/amis/${id}/repondre`, { statut });
    setDemandes((d) => d.filter((x) => x.id_amitie !== id));
    if (statut === 'accepte') fetchAmis();
  };

  const supprimer = async (id) => {
    if (!window.confirm('Retirer cet ami ?')) return;
    await api.delete(`/amis/${id}`);
    setAmis((a) => a.filter((x) => x.id_amitie !== id));
  };

  const RelationBtn = ({ user }) => {
    if (user.relation === 'ami')             return <span className={styles.tagAmi}>✓ Ami</span>;
    if (user.relation === 'demande_envoyee') return <span className={styles.tagAttente}>Demande envoyée</span>;
    if (user.relation === 'demande_recue')   return <span className={styles.tagAttente}>Demande reçue</span>;
    return (
      <button className="btn btn-primary btn-sm" onClick={() => envoyer(user.id_utilisateur)}>
        + Ajouter
      </button>
    );
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-7)', paddingBottom: 'var(--space-9)' }}>
      <h1 className="page-title">Mes amis</h1>

      {/* Recherche */}
      <form onSubmit={rechercher} className={styles.searchBar}>
        <input className="input" placeholder="Rechercher par pseudo ou email…"
          value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={loading}>Rechercher</button>
      </form>

      {/* Onglets */}
      <div className={styles.tabs}>
        <button className={tab === 'amis'      ? styles.active : ''} onClick={() => setTab('amis')}>
          Amis ({amis.length})
        </button>
        <button className={tab === 'demandes'  ? styles.active : ''} onClick={() => setTab('demandes')}>
          Demandes {demandes.length > 0 && <span className={styles.badge}>{demandes.length}</span>}
        </button>
        {resultats.length > 0 && (
          <button className={tab === 'recherche' ? styles.active : ''} onClick={() => setTab('recherche')}>
            Résultats ({resultats.length})
          </button>
        )}
      </div>

      {/* Amis */}
      {tab === 'amis' && (
        amis.length === 0
          ? <p className={styles.empty}>Vous n'avez pas encore d'amis. Recherchez des utilisateurs !</p>
          : <div className={styles.list}>
              {amis.map((a) => (
                <div key={a.id_amitie} className={styles.card}>
                  <UserCard user={a} />
                  <button className="btn btn-secondary btn-sm" onClick={() => supprimer(a.id_amitie)}>
                    Retirer
                  </button>
                </div>
              ))}
            </div>
      )}

      {/* Demandes reçues */}
      {tab === 'demandes' && (
        demandes.length === 0
          ? <p className={styles.empty}>Aucune demande en attente.</p>
          : <div className={styles.list}>
              {demandes.map((d) => (
                <div key={d.id_amitie} className={styles.card}>
                  <UserCard user={d} />
                  <div className={styles.demandeActions}>
                    <button className="btn btn-primary btn-sm"   onClick={() => repondre(d.id_amitie, 'accepte')}>Accepter</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => repondre(d.id_amitie, 'refuse')}>Refuser</button>
                  </div>
                </div>
              ))}
            </div>
      )}

      {/* Résultats recherche */}
      {tab === 'recherche' && (
        resultats.length === 0
          ? <p className={styles.empty}>Aucun résultat.</p>
          : <div className={styles.list}>
              {resultats.map((u) => (
                <div key={u.id_utilisateur} className={styles.card}>
                  <UserCard user={u} />
                  <RelationBtn user={u} />
                </div>
              ))}
            </div>
      )}
    </div>
  );
}

function UserCard({ user }) {
  return (
    <Link to={`/portfolio/${user.pseudo}`} className={styles.userCard}>
      <div className={styles.avatar}>
        {user.avatar
          ? <img src={user.avatar} alt={sanitize(user.pseudo)} width={44} height={44} />
          : <span>{user.pseudo[0].toUpperCase()}</span>
        }
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <p className={styles.pseudo}>{sanitize(user.pseudo)}</p>
          <UserBadge badge={user.badge} size="sm" />
        </div>
        {user.bio && <p className={styles.bio}>{sanitize(user.bio)}</p>}
      </div>
    </Link>
  );
}
