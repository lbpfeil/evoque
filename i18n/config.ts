export const i18nConfig = {
  // Supported languages
  supportedLngs: ['pt-BR', 'en'],

  // Default language (PT-BR as per requirements)
  fallbackLng: 'pt-BR',

  // Default namespace
  defaultNS: 'common',

  // Namespaces to load
  ns: ['common', 'auth', 'highlights', 'study', 'session', 'settings', 'dashboard', 'errors'],

  // Language detection order
  detection: {
    // Order of detection: localStorage first, then browser
    order: ['localStorage', 'navigator'],
    // Key for localStorage
    lookupLocalStorage: 'evoque-language',
    // Cache user language in localStorage
    caches: ['localStorage'],
  },

  // HTTP backend configuration (load from public/locales)
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },

  // React specific options
  react: {
    useSuspense: true,
  },

  // Interpolation settings
  interpolation: {
    escapeValue: false, // React already escapes
  },
};
