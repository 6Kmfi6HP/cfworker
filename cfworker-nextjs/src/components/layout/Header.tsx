"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe, Check, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language;

  return (
    <header className="px-4 sm:px-6 lg:px-8 py-4 border-b">
      <TooltipProvider delayDuration={0}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            {t('title')}
          </h1>

          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  aria-label={theme === 'light' ? t('header.switchToDarkMode') : t('header.switchToLightMode')}
                >
                  {theme === 'light' ? (
                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                  ) : (
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {theme === 'light' ? t('header.switchToDarkMode') : t('header.switchToLightMode')}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Language Switcher */}
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={t('header.changeLanguage')}>
                      <Globe className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>
                      <div className="flex items-center">
                        <span role="img" aria-label="USA flag" className="mr-2">🇺🇸</span>
                        {t('header.english')}
                        {currentLanguage === 'en' && <Check className="ml-auto h-4 w-4" />}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => i18n.changeLanguage('zh')}>
                      <div className="flex items-center">
                        <span role="img" aria-label="China flag" className="mr-2">🇨🇳</span>
                        {t('header.chinese')}
                        {currentLanguage === 'zh' && <Check className="ml-auto h-4 w-4" />}
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('header.changeLanguage')}</p>
              </TooltipContent>
            </Tooltip>

            {/* Settings Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => console.log('Account Management clicked')}
                  aria-label={t('header.accountManagement')}
                >
                  <Settings className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('header.accountManagement')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
      {/* Account Display Area Placeholder */}
      <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
        <div className="p-4 border rounded-md bg-muted/50 text-muted-foreground text-sm">
          {t('header.accountInfoPlaceholder')}
        </div>
      </div>
    </header>
  );
}
