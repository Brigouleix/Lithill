import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './Auth.module.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', pseudo: '', nom: '', prenom: '', mot_de_passe: '', confirm: '',
  });
  const [errors,  setErrors]  = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.email)         errs.email = 'Email requis';
    if (!form.pseudo)        errs.pseudo = 'Pseudo requis';
    if (!form.nom)           errs.nom = 'Nom requis';
    if (!form.prenom)        errs.prenom = 'Prénom requis';
    if (!form.mot_de_passe)  errs.mot_de_passe = 'Mot de passe requis';
    if (form.mot_de_passe !== form.confirm) errs.confirm = 'Les mots de passe ne correspondent pas';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await api.post('/auth/register', {
        email: form.email, pseudo: form.pseudo,
        nom: form.nom, prenom: form.prenom,
        mot_de_passe: form.mot_de_passe,
      });
      setSuccess('Compte créé ! Confirmez votre email puis connectez-vous.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setErrors({ global: data?.error || 'Erreur lors de l\'inscription' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Créer un compte</h1>
        <p className={styles.subtitle}>Rejoignez la communauté Lithill</p>

        {success && <p className="success-msg" style={{ marginBottom: 'var(--space-4)' }}>{success}</p>}
        {errors.global && <p className="error-msg" style={{ marginBottom: 'var(--space-4)' }}>{errors.global}</p>}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {[
            { name: 'email',        label: 'Email',           type: 'email' },
            { name: 'pseudo',       label: 'Pseudo',          type: 'text' },
            { name: 'prenom',       label: 'Prénom',          type: 'text' },
            { name: 'nom',          label: 'Nom',             type: 'text' },
            { name: 'mot_de_passe', label: 'Mot de passe',    type: 'password' },
            { name: 'confirm',      label: 'Confirmer le mot de passe', type: 'password' },
          ].map(({ name, label, type }) => (
            <div key={name} className={styles.field}>
              <label htmlFor={name}>{label}</label>
              <input id={name} name={name} type={type}
                className={`input ${errors[name] ? 'error' : ''}`}
                value={form[name]} onChange={handleChange} />
              {errors[name] && <span className="error-msg">{errors[name]}</span>}
            </div>
          ))}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className={styles.footer}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
