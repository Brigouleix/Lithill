import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme, THEMES } from '../../context/ThemeContext';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const current = THEMES.find((t) => t.key === theme) || THEMES[0];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>Lithill</Link>

        <nav className={styles.nav}>
          <NavLink to="/explorer" className={({ isActive }) => isActive ? styles.active : ''}>
            Explorer
          </NavLink>
          {user && (
            <>
              <NavLink to="/galerie" className={({ isActive }) => isActive ? styles.active : ''}>
                Ma galerie
              </NavLink>
              <NavLink to="/amis" className={({ isActive }) => isActive ? styles.active : ''}>
                Mes amis
              </NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink to="/admin/utilisateurs" className={({ isActive }) => isActive ? styles.active : ''}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className={styles.actions}>
          {/* Switcher de theme */}
          <div className={styles.themeSwitcher}>
            {THEMES.map((t) => (
              <button
                key={t.key}
                className={`${styles.themeBtn} ${theme === t.key ? styles.themeBtnActive : ''}`}
                onClick={() => setTheme(t.key)}
                title={t.label}
                aria-label={`Theme ${t.label}`}
              >
                {t.icon}
              </button>
            ))}
          </div>

          {user ? (
            <>
              <NavLink to="/dashboard" className="btn btn-secondary btn-sm">Mon espace</NavLink>
              <button onClick={handleLogout} className="btn btn-sm" style={{ color: 'var(--color-text-muted)' }}>
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login"       className="btn btn-secondary btn-sm">Connexion</Link>
              <Link to="/inscription" className="btn btn-primary btn-sm">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
