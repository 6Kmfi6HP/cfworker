"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n'; // Your initialized i18n instance

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // The i18n.init() is already called in src/i18n/index.ts
    // We just need to ensure it's loaded.
    // LanguageDetector will handle language changes.
    // If i18n.isInitialized is available and true, you could use it.
    // Otherwise, a small delay or a check on i18n.language can ensure readiness.
    if (i18n.isInitialized) {
      setIsInitialized(true);
    } else {
      // If not initialized, listen for the initialized event
      const handleInitialized = () => {
        setIsInitialized(true);
        i18n.off('initialized', handleInitialized);
      };
      i18n.on('initialized', handleInitialized);
      // In case it's already initialized but the state hook ran late
      if (i18n.isInitialized) {
        handleInitialized();
      }
    }
    
    // Optional: listen to language changes to force re-render if needed,
    // though react-i18next components should update automatically.
    const handleLanguageChanged = () => {
      // Force re-render, or rely on components to update
      setIsInitialized(false); // Toggle to force re-render
      setTimeout(() => setIsInitialized(true), 0);
    };
    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  if (!isInitialized) {
    // You can render a loading state here if needed
    return null; // Or <LoadingSpinner />;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
