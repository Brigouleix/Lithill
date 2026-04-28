import { Link } from 'react-router-dom';
import styles from './Error.module.css';

export default function Error500() {
  return (
    <div className={styles.page}>
      <div className={styles.code}>500</div>
      <h1 className={styles.title}>Erreur serveur</h1>
      <p className={styles.desc}>Une erreur inattendue s'est produite. Nos équipes ont été notifiées.</p>
      <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
    </div>
  );
}
