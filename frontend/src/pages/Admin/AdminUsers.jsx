import { useEffect, useState } from 'react';
import api from '../../services/api';
import { sanitize } from '../../utils/sanitize';
import styles from './Admin.module.css';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get(`/admin/users?page=${page}&q=${search}`)
      .then((r) => setUsers(r.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page, search]); // eslint-disable-line

  const ban = async (id) => {
    if (!window.confirm('Bannir cet utilisateur ?')) return;
    await api.patch(`/admin/users/${id}/ban`);
    setUsers((u) => u.map((x) => x.id_utilisateur === id ? { ...x, statut: 'banni' } : x));
  };

  const unban = async (id) => {
    await api.patch(`/admin/users/${id}/unban`);
    setUsers((u) => u.map((x) => x.id_utilisateur === id ? { ...x, statut: 'actif' } : x));
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-7)', paddingBottom: 'var(--space-9)' }}>
      <h1 className="page-title">Gestion des utilisateurs</h1>

      <div className={styles.toolbar}>
        <input className="input" style={{ maxWidth: 320 }}
          placeholder="Rechercher un utilisateur…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {loading ? <p className="loading">Chargement…</p> : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pseudo</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Inscription</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id_utilisateur}>
                <td>{sanitize(u.pseudo)}</td>
                <td>{sanitize(u.email)}</td>
                <td><span className="badge">{u.role}</span></td>
                <td>
                  <span className={`badge ${u.statut === 'actif' ? styles.actif : u.statut === 'banni' ? styles.banni : styles.attente}`}>
                    {u.statut}
                  </span>
                </td>
                <td>{new Date(u.date_inscription).toLocaleDateString('fr-FR')}</td>
                <td className={styles.actions}>
                  {u.statut !== 'banni'
                    ? <button className="btn btn-danger btn-sm" onClick={() => ban(u.id_utilisateur)}>Bannir</button>
                    : <button className="btn btn-secondary btn-sm" onClick={() => unban(u.id_utilisateur)}>Réactiver</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.pagination}>
        {page > 1 && <button className="btn btn-secondary btn-sm" onClick={() => setPage(page - 1)}>← Précédent</button>}
        {users.length === 12 && <button className="btn btn-secondary btn-sm" onClick={() => setPage(page + 1)}>Suivant →</button>}
      </div>
    </div>
  );
}
