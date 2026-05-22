import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from '@event-manager/i18n';

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
