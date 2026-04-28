import { Link } from 'react-router-dom';
import styles from './Error.module.css';

export default function Error404() {
  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>Page introuvable</h1>
      <p className={styles.desc}>Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
    </div>
  );
}
