import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CookieContext = createContext(null);

const STORAGE_KEY = 'lithill_cookie_consent';

export function CookieProvider({ children }) {
  const [consent,    setConsent]    = useState(null);   // null = pas encore choisi
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (new Date(parsed.expires) > new Date()) {
        setConsent(parsed.choices);
        return;
      }
    }
    setShowBanner(true);
  }, []);

  const saveConsent = (choices) => {
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 13);          // 13 mois CNIL
    const record = { choices, expires: expires.toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    setConsent(choices);
    setShowBanner(false);

    // Envoyer au backend pour traçabilité RGPD
    api.post('/consentements', choices).catch(() => {});
  };

  const acceptAll  = () => saveConsent({ fonctionnel: true, analytique: true, marketing: false });
  const refuseAll  = () => saveConsent({ fonctionnel: true, analytique: false, marketing: false });
  const customize  = (choices) => saveConsent({ fonctionnel: true, ...choices });

  return (
    <CookieContext.Provider value={{ consent, showBanner, acceptAll, refuseAll, customize }}>
      {children}
    </CookieContext.Provider>
  );
}

export const useCookies = () => useContext(CookieContext);
