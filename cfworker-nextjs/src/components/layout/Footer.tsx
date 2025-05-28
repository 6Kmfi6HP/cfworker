import React from 'react';
import { useTranslation } from 'react-i18next';
import { Github } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // Replace with your actual repository URL
  const sourceCodeUrl = 'https://github.com/your-username/cfworker-nextjs'; 

  return (
    <footer className="px-4 sm:px-6 lg:px-8 py-6 mt-12 border-t">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
        <p>
          {t('footer.copyright', { year: currentYear })}
        </p>
        <a
          href={sourceCodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:text-foreground transition-colors mt-2 sm:mt-0"
        >
          <Github className="h-4 w-4 mr-1.5" />
          {t('footer.sourceCode')}
        </a>
      </div>
    </footer>
  );
}
