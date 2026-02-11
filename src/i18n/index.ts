import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ko from './ko.json';

const savedLang = typeof localStorage !== 'undefined'
  ? localStorage.getItem('kmirror_lang') || 'en'
  : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('kmirror_lang', lng);
});

export default i18n;
