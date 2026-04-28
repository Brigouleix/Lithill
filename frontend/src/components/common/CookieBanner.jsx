import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from '../../context/CookieContext';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
  const { showBanner, acceptAll, refuseAll, customize } = useCookies();
  const [showCustom, setShowCustom] = useState(false);
  const [analytique, setAnalytique] = useState(false);

  if (!showBanner) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-label="Gestion des cookies">
      <div className={styles.banner}>
        <h2 className={styles.title}>Vos préférences cookies</h2>
        <p className={styles.desc}>
          Lithill utilise des cookies pour le bon fonctionnement du site. Vous pouvez accepter ou refuser
          les cookies optionnels. Consultez notre{' '}
          <Link to="/confidentialite#cookies">politique de confidentialité</Link>.
        </p>

        {showCustom ? (
          <div className={styles.customPanel}>
            <label className={styles.cookieRow}>
              <span>
                <strong>Fonctionnels</strong>
                <small>Nécessaires au fonctionnement (session, sécurité)</small>
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
            <div className={styles.actions}>
              <button className="btn btn-primary btn-sm" onClick={() => customize({ analytique })}>
                Enregistrer mes choix
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCustom(false)}>
                Retour
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.actions}>
            <button className="btn btn-primary"   onClick={acceptAll}>Tout accepter</button>
            <button className="btn btn-secondary" onClick={refuseAll}>Tout refuser</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCustom(true)}>
              Personnaliser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
