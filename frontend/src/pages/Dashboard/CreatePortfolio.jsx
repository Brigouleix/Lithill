import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import styles from './EditProjet.module.css';

export default function CreatePortfolio() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const editSlug       = searchParams.get('edit');
  const isEdit         = Boolean(editSlug);

  const [form,        setForm]        = useState({ titre: '', description: '', visibilite: 'public' });
  const [coverFile,   setCoverFile]   = useState(null);
  const [coverPreview,setCoverPreview]= useState(null);
  const [currentCover,setCurrentCover]= useState(null);
  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);
  const [loading,     setLoading]     = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/portfolios/${editSlug}`)
      .then((r) => {
        setForm({ titre: r.data.titre, description: r.data.description || '', visibilite: r.data.visibilite });
        setCurrentCover(r.data.image_couverture || null);
      })
      .finally(() => setLoading(false));
  }, [editSlug, isEdit]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim()) { setErrors({ titre: 'Titre requis' }); return; }
    setErrors({});
    setSaving(true);
    try {
      let slug = editSlug;
      if (isEdit) {
        await api.patch(`/portfolios/${editSlug}`, form);
      } else {
        const r = await api.post('/portfolios', form);
        slug = r.data.slug;
      }
      if (coverFile && slug) {
        const fd = new FormData();
        fd.append('couverture', coverFile);
        await api.post(`/portfolios/${slug}/couverture`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setErrors(data?.errors || { global: data?.error || 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="loading">Chargement...</p>;

  const preview = coverPreview || currentCover;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-7)', paddingBottom: 'var(--space-9)' }}>
      <h1 className="page-title">{isEdit ? "Modifier le portfolio" : "Nouveau portfolio"}</h1>

      {errors.global && <p className="error-msg" style={{ marginBottom: 'var(--space-4)' }}>{errors.global}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Titre *</label>
          <input className={`input ${errors.titre ? 'error' : ''}`}
            value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })}
            placeholder="ex : Photographie - Portraits" maxLength={255} />
          {errors.titre && <span className="error-msg">{errors.titre}</span>}
        </div>

        <div className={styles.field}>
          <label>Description</label>
          <textarea className="input" rows={4}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Presentez ce portfolio..." maxLength={2000} />
        </div>

        <div className={styles.field}>
          <label>Visibilite</label>
          <select className="input" value={form.visibilite}
            onChange={(e) => setForm({ ...form, visibilite: e.target.value })}>
            <option value="public">Public - visible par tous</option>
            <option value="prive">Prive - visible par moi seul</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Image de couverture</label>
          {preview && (
            <div className={styles.coverPreview}>
              <img src={preview} alt="Apercu couverture" />
            </div>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverChange} style={{ marginTop: 'var(--space-2)' }} />
          <small style={{ color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>
            JPG, PNG, WebP - 5 Mo max. Affichee comme vignette du portfolio.
          </small>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Sauvegarde..." : isEdit ? "Enregistrer" : "Creer le portfolio"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
