import { useEffect, useState } from 'react';
import api from '../../services/api';
import { sanitize } from '../../utils/sanitize';
import styles from './Admin.module.css';

export default function AdminModeration() {
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/admin/commentaires/signales')
      .then((r) => setComments(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const moderate = async (id, statut) => {
    await api.patch(`/admin/commentaires/${id}/moderer`, { statut });
    setComments((c) => c.filter((x) => x.id_commentaire !== id));
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-7)', paddingBottom: 'var(--space-9)' }}>
      <h1 className="page-title">Modération des commentaires</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
        {comments.length} commentaire{comments.length > 1 ? 's' : ''} signalé{comments.length > 1 ? 's' : ''}
      </p>

      {loading ? <p className="loading">Chargement…</p> : comments.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Aucun commentaire signalé.</p>
      ) : (
        <div className={styles.commentList}>
          {comments.map((c) => (
            <div key={c.id_commentaire} className={styles.commentCard}>
              <div className={styles.commentMeta}>
                <strong>{sanitize(c.pseudo)}</strong>
                <span>sur <em>{sanitize(c.projet_titre)}</em></span>
                <span className={styles.date}>{new Date(c.date_creation).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className={styles.commentText}>{sanitize(c.contenu)}</p>
              <div className={styles.commentActions}>
                <button className="btn btn-secondary btn-sm" onClick={() => moderate(c.id_commentaire, 'publie')}>
                  Rétablir
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => moderate(c.id_commentaire, 'supprime')}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
