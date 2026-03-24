import { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('bistro_lang') || 'en');

  const toggle = () =>
    setLang(prev => {
      const next = prev === 'en' ? 'th' : 'en';
      localStorage.setItem('bistro_lang', next);
      return next;
    });

  // t('key', { n: 5, count: 2 }) → replaces {n}, {count}, etc.
  const t = (key, params = {}) => {
    let str = translations[lang]?.[key] ?? translations.en[key] ?? key;
    Object.entries(params).forEach(([k, v]) => {
      str = str.replaceAll(`{${k}}`, v);
    });
    return str;
  };

  // Returns Thai name/desc if lang=th and field exists, otherwise English
  const itemName = (item) => (lang === 'th' && item?.nameTH) ? item.nameTH : item?.name;
  const itemDesc = (item) => (lang === 'th' && item?.descTH)  ? item.descTH  : item?.description;

  return (
    <LanguageContext.Provider value={{ lang, toggle, t, itemName, itemDesc }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);

/* ── Reusable toggle button — drop anywhere in a header ── */
export function LangToggle({ className = '' }) {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      title={lang === 'en' ? 'Switch to Thai' : 'Switch to English'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all hover:opacity-80 active:scale-95 ${className}`}
    >
      {lang === 'en' ? '🇹🇭 TH' : '🇬🇧 EN'}
    </button>
  );
}
