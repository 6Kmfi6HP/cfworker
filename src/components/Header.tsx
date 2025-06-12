import React from 'react';
import { Button, Modal, Image, Space, Tooltip, Dropdown, MenuProps } from 'antd';
import { SunOutlined, MoonOutlined, GlobalOutlined, SettingOutlined } from '@ant-design/icons';
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
  selectedLanguage,
  onLanguageChange,
  onShowAccountManagement,
  showApiKeyModal,
  onCloseApiKeyModal,
  onShowApiKeyModal
}) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { currentAccount } = useAccount();

  const languageMenuItems: MenuProps['items'] = [
    {
      key: 'en',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇺🇸</span>
          <span>English</span>
          {selectedLanguage === 'en' && <span style={{ color: '#1890ff' }}>✓</span>}
        </div>
      ),
      onClick: () => onLanguageChange('en'),
    },
    {
      key: 'zh',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇨🇳</span>
          <span>中文</span>
          {selectedLanguage === 'zh' && <span style={{ color: '#1890ff' }}>✓</span>}
        </div>
      ),
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
          <div style={headerStyles.controlsContainer}>
            <Space size={window.innerWidth < 768 ? 'small' : 'middle'}>
              {/* Theme Toggle */}
              <Tooltip 
                title={theme === 'light' ? t('switchToDark', 'Switch to Dark Mode') : t('switchToLight', 'Switch to Light Mode')}
                placement="bottom"
              >
                <Button
                  type="text"
                  icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  style={headerStyles.controlButton}
                />
              </Tooltip>

              {/* Language Selector */}
              <Dropdown
                menu={{ items: languageMenuItems }}
                placement="bottomRight"
                trigger={['click']}
                overlayStyle={{
                  minWidth: 'clamp(120px, 30vw, 160px)'
                }}
              >
                <Tooltip title={t('changeLanguage', 'Change Language')} placement="bottom">
                  <Button
                    type="text"
                    icon={<GlobalOutlined />}
                    style={headerStyles.controlButton}
                  />
                </Tooltip>
              </Dropdown>

              {/* Settings */}
              <Tooltip title={t('accountManagement', 'Account Management')} placement="bottom">
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  onClick={onShowAccountManagement}
                  style={headerStyles.controlButton}
                />
              </Tooltip>
            </Space>
          </div>
        </div>
        
        {/* Account Selector */}
        <div style={headerStyles.accountSelectorContainer}>
          <AccountSelector
          onManageAccounts={onShowAccountManagement}
          onAddAccount={() => {
            onShowAccountManagement();
            // 延迟触发添加账号操作，确保弹窗已打开
            setTimeout(() => {
              const addButton = document.querySelector('.account-toolbar .ant-btn-primary');
              if (addButton) {
                (addButton as HTMLElement).click();
              }
            }, 100);
          }}
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
              <Space 
                direction={window.innerWidth < 480 ? 'vertical' : 'horizontal'} 
                size="small"
                style={{ width: '100%' }}
              >
                <Button 
                  type="link" 
                  onClick={onShowApiKeyModal}
                  style={headerStyles.linkButton}
                >
                  {t('howToGetApiKey')}
                </Button>
                <Button 
                  type="link"
                  href="https://youtu.be/PZMbH7awZRE?si=UxohdialRXq8dL2F"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={headerStyles.linkButton}
                >
                  {t('Towatchvideo')}
                </Button>
              </Space>
            </div>
          )}
        </div>
      </div>

      {/* API Key Instructions Modal */}
      <Modal
        open={showApiKeyModal}
        footer={null}
        onCancel={onCloseApiKeyModal}
        width={Math.min(800, window.innerWidth * 0.9)}
        style={{ 
          top: window.innerWidth < 768 ? 10 : 20,
          maxWidth: '95vw'
        }}
        styles={{
          body: {
            padding: window.innerWidth < 768 ? '16px' : '24px'
          }
        }}
      >
        <Image 
          src={img} 
          alt="" 
          style={{ 
            width: '100%',
            maxWidth: '100%',
            height: 'auto'
          }} 
        />
        <div style={{ 
          marginTop: 'clamp(12px, 3vw, 16px)', 
          lineHeight: 1.6,
          fontSize: 'clamp(12px, 3vw, 14px)'
        }}>
          <div dangerouslySetInnerHTML={{ __html: t('apiKeyInstructions1') }} />
          <div dangerouslySetInnerHTML={{ __html: t('apiKeyInstructions2') }} />
          <div dangerouslySetInnerHTML={{ __html: t('apiKeyInstructions3') }} />
        </div>
      </Modal>
    </>
  );
};

export default Header;