import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { sanitize } from '../../utils/sanitize';
import styles from './EditProjet.module.css';

export default function EditProjet() {
  const { slug }       = useParams();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const albumSlug      = searchParams.get('album');
  const isEdit         = Boolean(slug);

  const [categories,   setCategories]   = useState([]);
  const [form,         setForm]         = useState({ titre: '', description: '', statut: 'brouillon', categories: [], tags: '' });
  const [pendingFiles, setPendingFiles] = useState([]); // { id, file, preview }
  const [medias,       setMedias]       = useState([]);
  const [errors,       setErrors]       = useState({});
  const [saving,       setSaving]       = useState(false);
  const [uploadIndex,  setUploadIndex]  = useState(null); // current upload position
  const [loading,      setLoading]      = useState(isEdit);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data));
    if (isEdit) {
      api.get(`/projets/${slug}`)
        .then((r) => {
          setForm({
            titre:       r.data.titre,
            description: r.data.description || '',
            statut:      r.data.statut,
            categories:  r.data.categories.map((c) => c.id_categorie),
            tags:        r.data.tags.map((t) => t.nom).join(', '),
          });
          setMedias(r.data.medias || []);
        })
        .finally(() => setLoading(false));
    }
  }, [slug, isEdit]);

  const addFiles = useCallback((e) => {
    const incoming = Array.from(e.target.files).map((file) => ({
      id:      Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
    }));
    setPendingFiles((prev) => [...prev, ...incoming]);
    e.target.value = '';
  }, []);

  const removeFile = useCallback((id) => {
    setPendingFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.titre.trim()) errs.titre = 'Titre requis';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setUploadIndex(null);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        ...(albumSlug && !isEdit ? { portfolio_slug: albumSlug } : {}),
      };
      let projet;
      if (isEdit) {
        const r = await api.patch(`/projets/${slug}`, payload);
        projet = r.data;
      } else {
        const r = await api.post('/projets', payload);
        projet = r.data;
      }

      for (let i = 0; i < pendingFiles.length; i++) {
        setUploadIndex(i);
        const fd = new FormData();
        fd.append('media', pendingFiles[i].file);
        await api.post(`/projets/${projet.slug}/medias`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      pendingFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setErrors(data?.errors || { global: data?.error || 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
      setUploadIndex(null);
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('Supprimer ce media ?')) return;
    await api.delete(`/projets/${slug}/medias/${id}`);
    setMedias((m) => m.filter((x) => x.id_media !== id));
  };

  if (loading) return <p className="loading">Chargement...</p>;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-7)', paddingBottom: 'var(--space-9)' }}>
      <h1 className="page-title">{isEdit ? 'Modifier le projet' : 'Nouveau projet'}</h1>

      {errors.global && <p className="error-msg" style={{ marginBottom: 'var(--space-4)' }}>{errors.global}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Titre *</label>
          <input className={`input ${errors.titre ? 'error' : ''}`} value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })} maxLength={255} />
          {errors.titre && <span className="error-msg">{errors.titre}</span>}
        </div>

        <div className={styles.field}>
          <label>Description</label>
          <textarea className="input" rows={5} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={5000} />
        </div>

        <div className={styles.field}>
          <label>Statut</label>
          <select className="input" value={form.statut}
            onChange={(e) => setForm({ ...form, statut: e.target.value })}>
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publie</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Categories</label>
          <div className={styles.checkboxGrid}>
            {categories.map((c) => (
              <label key={c.id_categorie} className={styles.checkItem}>
                <input
                  type="checkbox"
                  checked={form.categories.includes(c.id_categorie)}
                  onChange={(e) => {
                    const cats = e.target.checked
                      ? [...form.categories, c.id_categorie]
                      : form.categories.filter((id) => id !== c.id_categorie);
                    setForm({ ...form, categories: cats });
                  }}
                />
                {sanitize(c.nom)}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label>Tags <small>(separes par des virgules)</small></label>
          <input className="input" value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="photographie, portrait, noir et blanc" />
        </div>

        {/* Upload multi-photos */}
        <div className={styles.field}>
          <label>
            Ajouter des photos
            {pendingFiles.length > 0 && (
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: '.875rem', marginLeft: 8 }}>
                {pendingFiles.length} photo{pendingFiles.length > 1 ? 's' : ''} en attente
              </span>
            )}
          </label>
          <label className={styles.dropZone}>
            <span>+ Selectionner des photos</span>
            <input type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={addFiles} />
          </label>

          {pendingFiles.length > 0 && (
            <div className={styles.previewGrid}>
              {pendingFiles.map(({ id, preview, file }) => (
                <div key={id} className={styles.previewItem}>
                  <img src={preview} alt={file.name} />
                  <span className={styles.previewName}>{file.name}</span>
                  <button type="button" className={styles.removePreview} onClick={() => removeFile(id)}>
                    &#215;
                  </button>
                </div>
              ))}
            </div>
          )}

          {saving && pendingFiles.length > 0 && (
            <div className={styles.uploadProgress}>
              <span>
                Upload {uploadIndex !== null ? uploadIndex + 1 : 0} / {pendingFiles.length}
              </span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${uploadIndex !== null ? ((uploadIndex + 1) / pendingFiles.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          <small className={styles.hint}>JPG, PNG, WebP, GIF — 5 Mo max par image</small>
        </div>

        {/* Photos existantes (mode edition) */}
        {isEdit && medias.length > 0 && (
          <div className={styles.field}>
            <label>Photos actuelles</label>
            <div className={styles.mediaGrid}>
              {medias.map((m) => (
                <div key={m.id_media} className={styles.mediaItem}>
                  <img src={m.url_stockage} alt="" />
                  <button type="button" className={`btn btn-danger btn-sm ${styles.deleteMedia}`}
                    onClick={() => handleDeleteMedia(m.id_media)}>&#215;</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.formActions}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving
              ? (pendingFiles.length > 0 ? `Upload ${uploadIndex !== null ? uploadIndex + 1 : 0}/${pendingFiles.length}...` : 'Sauvegarde...')
              : isEdit ? 'Enregistrer' : 'Creer le projet'
            }
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
