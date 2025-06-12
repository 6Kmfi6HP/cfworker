import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sun, Moon, Globe, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import { useAccount } from '../contexts/AccountContext';
import AccountSelector from './AccountSelector';
import img from '../getGlobalAPIKey.png';

interface HeaderProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onShowAccountManagement: () => void;
  showApiKeyModal: boolean;
  onCloseApiKeyModal: () => void;
  onShowApiKeyModal: () => void;
}

const Header: React.FC<HeaderProps> = ({
  selectedLanguage: _selectedLanguage,
  onLanguageChange,
  onShowAccountManagement,
  showApiKeyModal,
  onCloseApiKeyModal,
  onShowApiKeyModal
}) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { currentAccount } = useAccount();

  const languageMenuItems = [
    {
      key: 'en',
      label: '🇺🇸 English',
      onClick: () => onLanguageChange('en'),
    },
    {
      key: 'zh',
      label: '🇨🇳 中文',
      onClick: () => onLanguageChange('zh'),
    },
  ];

  // 响应式样式
  const headerStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 'clamp(16px, 4vw, 24px)',
      padding: 'clamp(16px, 4vw, 24px) clamp(12px, 3vw, 20px)',
      position: 'relative' as const,
      maxWidth: '100%',
      overflow: 'hidden'
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
      gap: 'clamp(12px, 3vw, 16px)',
      minHeight: 'clamp(40px, 8vw, 60px)'
    },
    title: {
      margin: 0,
      fontSize: 'clamp(18px, 5vw, 32px)',
      fontWeight: 600,
      background: 'linear-gradient(135deg, #1890ff, #722ed1)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: 1.2,
      wordBreak: 'break-word' as const,
      flex: '1 1 auto',
      minWidth: 0
    },
    controlsContainer: {
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center'
    },
    controlButton: {
      borderRadius: 'clamp(6px, 2vw, 8px)',
      width: 'clamp(36px, 8vw, 40px)',
      height: 'clamp(36px, 8vw, 40px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(14px, 3.5vw, 16px)',
      backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      minWidth: 'clamp(36px, 8vw, 40px)',
      padding: 0
    },
    accountSelectorContainer: {
      width: '100%',
      overflow: 'hidden'
    },
    statusCard: {
      padding: 'clamp(16px, 4vw, 20px)',
      borderRadius: 'clamp(8px, 2vw, 12px)',
      backgroundColor: theme === 'light' ? 'rgba(24, 144, 255, 0.05)' : 'rgba(24, 144, 255, 0.1)',
      border: `1px solid ${theme === 'light' ? 'rgba(24, 144, 255, 0.15)' : 'rgba(24, 144, 255, 0.2)'}`,
      lineHeight: 1.6,
      fontSize: 'clamp(14px, 3.5vw, 16px)'
    },
    statusTitle: {
      fontSize: 'clamp(14px, 3.5vw, 16px)',
      fontWeight: 500,
      marginBottom: 'clamp(6px, 2vw, 8px)',
      wordBreak: 'break-word' as const
    },
    statusDescription: {
      fontSize: 'clamp(12px, 3vw, 14px)',
      opacity: 0.8,
      lineHeight: 1.5
    },
    warningTitle: {
      fontSize: 'clamp(14px, 3.5vw, 16px)',
      fontWeight: 500,
      marginBottom: 'clamp(8px, 2vw, 12px)',
      color: theme === 'light' ? '#fa8c16' : '#ffc53d',
      wordBreak: 'break-word' as const
    },
    linkButton: {
      padding: 0,
      height: 'auto',
      fontSize: 'clamp(12px, 3vw, 14px)',
      textAlign: 'left' as const,
      wordBreak: 'break-word' as const
    }
  };

  return (
    <>
      <div className="header" style={headerStyles.container}>
        {/* Top Bar with Title and Controls */}
        <div style={headerStyles.topBar}>
          {/* Title */}
          <h1 style={headerStyles.title}>
            {t('title')}
          </h1>

          {/* Controls */}
          <TooltipProvider>
            <div style={headerStyles.controlsContainer}>
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                      style={headerStyles.controlButton}
                    >
                      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{theme === 'light' ? t('switchToDark', 'Switch to Dark Mode') : t('switchToLight', 'Switch to Light Mode')}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Language Selector */}
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          style={headerStyles.controlButton}
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('changeLanguage', 'Change Language')}</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end">
                    {languageMenuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.key}
                        onClick={item.onClick}
                        className="text-sm"
                      >
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Settings */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onShowAccountManagement}
                      style={headerStyles.controlButton}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('accountManagement', 'Account Management')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
        </div>
        
        {/* Account Selector */}
        <div style={headerStyles.accountSelectorContainer}>
          <AccountSelector
            onManageAccounts={onShowAccountManagement}
            onAddAccount={onShowAccountManagement}
          />
        </div>
        
        {/* Account Status and Instructions */}
        <div style={headerStyles.statusCard}>
          {currentAccount ? (
            <div>
              <div style={{
                ...headerStyles.statusTitle,
                color: theme === 'light' ? '#1890ff' : '#69c0ff'
              }}>
                {t('currentAccountDescription', 'Using account:')} <strong>{currentAccount.name || currentAccount.email}</strong>
              </div>
              <div style={headerStyles.statusDescription}>
                {t('accountManagementDescription', 'You can manage your accounts using the selector above.')}
              </div>
            </div>
          ) : (
            <div>
              <div style={headerStyles.warningTitle}>
                {t('noAccountSelected', 'No account selected. Please add and select an account to continue.')}
              </div>
              <div 
                className={`flex gap-2 w-full ${window.innerWidth < 480 ? 'flex-col' : 'flex-row'}`}
              >
                <Button 
                  variant="link" 
                  onClick={onShowApiKeyModal}
                  style={headerStyles.linkButton}
                  className="p-0 h-auto text-left justify-start"
                >
                  {t('howToGetApiKey')}
                </Button>
                <Button 
                  variant="link"
                  asChild
                  style={headerStyles.linkButton}
                  className="p-0 h-auto text-left justify-start"
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
      </div>

      {/* API Key Instructions Modal */}
      <Dialog open={showApiKeyModal} onOpenChange={(open) => !open && onCloseApiKeyModal()}>
        <DialogContent 
          className="max-w-[800px] w-[90vw] max-h-[90vh] overflow-y-auto"
          style={{
            padding: window.innerWidth < 768 ? '16px' : '24px'
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('apiKeyInstructions', 'API Key Instructions')}</DialogTitle>
            <DialogDescription>
              {t('apiKeyInstructionsDescription', 'Learn how to obtain your Cloudflare Global API Key for account management.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <img 
              src={img} 
              alt="API Key Instructions" 
              className="w-full h-auto"
            />
            <div style={{ 
              lineHeight: 1.6,
              fontSize: 'clamp(12px, 3vw, 14px)'
            }}>
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