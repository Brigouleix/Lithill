import { useState } from 'react';
import { useCookies } from '../../context/CookieContext';
import styles from './Privacy.module.css';

export default function Privacy() {
  const { consent, customize } = useCookies();
  const [analytique, setAnalytique] = useState(consent?.analytique ?? false);
  const [saved,      setSaved]      = useState(false);

  const handleSave = () => {
    customize({ analytique });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="container">
      <div className={styles.page}>
        <h1 className="page-title">Politique de confidentialité</h1>
        <p className={styles.updated}>Dernière mise à jour : Avril 2026</p>

        <section className={styles.section}>
          <h2>1. Qui sommes-nous ?</h2>
          <p>Lithill est une plateforme de portfolios amateurs. Responsable de traitement : <strong>Lithill</strong> — contact : <a href="mailto:privacy@lithill.local">privacy@lithill.local</a></p>
        </section>

        <section className={styles.section}>
          <h2>2. Données collectées</h2>
          <ul>
            <li><strong>Compte</strong> : email, pseudo, nom, prénom, mot de passe (haché)</li>
            <li><strong>Contenu</strong> : portfolios, projets, images uploadées, commentaires</li>
            <li><strong>Technique</strong> : adresse IP, user-agent (logs de sécurité)</li>
            <li><strong>Cookies</strong> : session de connexion, préférences de consentement</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Finalités et base légale</h2>
          <table className={styles.table}>
            <thead><tr><th>Finalité</th><th>Base légale</th></tr></thead>
            <tbody>
              <tr><td>Gestion des comptes utilisateurs</td><td>Exécution du contrat</td></tr>
              <tr><td>Sécurité et lutte contre la fraude</td><td>Intérêt légitime</td></tr>
              <tr><td>Mesure d'audience</td><td>Consentement</td></tr>
              <tr><td>Conformité légale</td><td>Obligation légale</td></tr>
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h2>4. Durée de conservation</h2>
          <ul>
            <li>Compte actif : durée de la relation</li>
            <li>Compte supprimé : 3 ans (obligations légales)</li>
            <li>Logs de sécurité : 12 mois</li>
            <li>Consentement cookies : 13 mois</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de portabilité et d'opposition. Pour les exercer : <a href="mailto:privacy@lithill.local">privacy@lithill.local</a></p>
          <p style={{ marginTop: 'var(--space-3)' }}>Vous pouvez également déposer une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">CNIL</a>.</p>
        </section>

        <section id="cookies" className={styles.section}>
          <h2>6. Gestion des cookies</h2>
          <p>Modifiez vos préférences ci-dessous :</p>
          <div className={styles.cookiePanel}>
            <label className={styles.cookieRow}>
              <span>
                <strong>Fonctionnels</strong>
                <small>Session, sécurité — obligatoires</small>
              </span>
              <input type="checkbox" checked disabled />
            </label>
            <label className={styles.cookieRow}>
              <span>
                <strong>Analytiques</strong>
                <small>Mesure d'audience anonymisée</small>
              </span>
              <input type="checkbox" checked={analytique} onChange={(e) => setAnalytique(e.target.checked)} />
            </label>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              {saved ? '✓ Enregistré' : 'Enregistrer mes préférences'}
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>7. Sécurité</h2>
          <p>Les mots de passe sont hachés avec bcrypt. Les communications sont chiffrées (HTTPS/TLS). Des logs d'audit sont conservés conformément aux recommandations ANSSI.</p>
        </section>
      </div>
    </div>
  );
}
