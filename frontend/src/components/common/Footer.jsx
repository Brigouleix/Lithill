import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.brand}>Lithill &copy; {new Date().getFullYear()}</p>
        <nav className={styles.links}>
          <Link to="/confidentialite">Politique de confidentialité</Link>
          <Link to="/confidentialite#cookies">Gestion des cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
