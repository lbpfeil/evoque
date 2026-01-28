import React, { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { Loader2 } from 'lucide-react';

// Loading fallback while translations load
const I18nLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-sm" />
      <p className="text-caption text-muted-foreground">Carregando idioma...</p>
    </div>
  </div>
);

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<I18nLoadingFallback />}>
        {children}
      </Suspense>
    </I18nextProvider>
  );
};
