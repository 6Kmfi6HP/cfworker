import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe, Settings } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useAccount } from '../contexts/AccountContext';
import AccountSelector from './AccountSelector';
import img from '../getGlobalAPIKey.png';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface HeaderProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onShowAccountManagement: () => void;
  onShowAddAccount: () => void;
  showApiKeyModal: boolean;
  onCloseApiKeyModal: () => void;
  onShowApiKeyModal: () => void;
}

const Header: React.FC<HeaderProps> = ({
  selectedLanguage,
  onLanguageChange,
  onShowAccountManagement,
  onShowAddAccount,
  showApiKeyModal,
  onCloseApiKeyModal,
  onShowApiKeyModal,
}) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { currentAccount } = useAccount();

  const languageMenuItems = [
    {
      key: 'en',
      label: 'English',
      icon: '🇺🇸',
    },
    {
      key: 'zh',
      label: '中文',
      icon: '🇨🇳',
    },
  ];

  return (
    <>
      <header className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 relative max-w-full overflow-hidden">
        {/* Top Bar with Title and Controls */}
        <div className="flex justify-between items-center flex-wrap gap-4 min-h-[40px] md:min-h-[60px]">
          {/* Title */}
          <h1 className="text-xl md:text-3xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text break-words flex-1 min-w-0">
            {t('title')}
          </h1>

          {/* Controls */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Theme Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    >
                      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{theme === 'light' ? t('switchToDark') : t('switchToLight')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languageMenuItems.map(item => (
                    <DropdownMenuItem key={item.key} onClick={() => onLanguageChange(item.key)}>
                      <span className="mr-2">{item.icon}</span>
                      <span>{item.label}</span>
                      {selectedLanguage === item.key && <span className="ml-auto text-blue-500">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Settings */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onShowAccountManagement}>
                      <Settings className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('accountManagement')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        {/* Account Selector */}
        <div className="w-full overflow-hidden">
          <AccountSelector
            onManageAccounts={onShowAccountManagement}
            onAddAccount={onShowAddAccount}
          />
        </div>
        
        {/* Account Status and Instructions */}
        <div className="p-4 md:p-5 rounded-lg bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 text-sm md:text-base">
          {currentAccount ? (
            <div>
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {t('currentAccountDescription')} <strong>{currentAccount.name || currentAccount.email}</strong>
              </div>
              <div className="text-muted-foreground text-xs md:text-sm">
                {t('accountManagementDescription')}
              </div>
            </div>
          ) : (
            <div>
              <div className="font-medium text-amber-600 dark:text-amber-400">
                {t('noAccountSelected')}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-2">
                <Button 
                  variant="link"
                  className="p-0 h-auto text-xs md:text-sm text-left"
                  onClick={onShowApiKeyModal}
                >
                  {t('howToGetApiKey')}
                </Button>
                <Button 
                  variant="link"
                  asChild
                  className="p-0 h-auto text-xs md:text-sm text-left"
                >
                  <a
                    href="https://youtu.be/PZMbH7awZRE?si=UxohdialRXq8dL2F"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('Towatchvideo')}
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* API Key Instructions Modal */}
      <Dialog open={showApiKeyModal} onOpenChange={onCloseApiKeyModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('howToGetApiKey')}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img 
              src={img} 
              alt="API Key Instructions" 
              className="w-full h-auto rounded-md border"
            />
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div dangerouslySetInnerHTML={{ __html: t('apiKeyInstructions1') }} />
              <div dangerouslySetInnerHTML={{ __html: t('apiKeyInstructions2') }} />
              <div dangerouslySetInnerHTML={{ __html: t('apiKeyInstructions3') }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;