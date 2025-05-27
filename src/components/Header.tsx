import React from 'react';
import { Button, Switch, Modal, Image } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
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

  return (
    <>
      <div className="header">
        <h1>
          {t('title')}
          <Switch
            checkedChildren={<SunOutlined />}
            unCheckedChildren={<MoonOutlined />}
            checked={theme === 'light'}
            onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{ marginLeft: '10px' }}
          />
          <Switch
            checkedChildren="EN"
            unCheckedChildren="中"
            checked={selectedLanguage === 'en'}
            onChange={(checked) => onLanguageChange(checked ? 'en' : 'zh')}
            style={{ marginLeft: '10px' }}
          />
        </h1>
        
        {/* Account Selector */}
        <div style={{ marginBottom: '24px' }}>
          <AccountSelector
            onManageAccounts={onShowAccountManagement}
            onAddAccount={onShowAccountManagement}
          />
        </div>
        
        <p>
          {currentAccount ? (
            <>
              {t('currentAccountDescription', 'Using account:')} <strong>{currentAccount.name || currentAccount.email}</strong>
              <br />
              {t('accountManagementDescription', 'You can manage your accounts using the selector above.')}
            </>
          ) : (
            <>
              {t('noAccountSelected', 'No account selected. Please add and select an account to continue.')}
              <br />
              <Button size="large" color="default" type="link" onClick={onShowApiKeyModal}>
                {t('howToGetApiKey')}
              </Button>
            </>
          )}
          <p>
            <Button 
              size="large" 
              color="default" 
              type="link" 
              href="https://youtu.be/PZMbH7awZRE?si=UxohdialRXq8dL2F"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Towatchvideo')}
            </Button>
          </p>
        </p>
      </div>

      {/* API Key Instructions Modal */}
      <Modal
        open={showApiKeyModal}
        footer={null}
        onCancel={onCloseApiKeyModal}
      >
        <Image src={img} alt="" />
        <p dangerouslySetInnerHTML={{ __html: t('apiKeyInstructions1') }} />
        <p dangerouslySetInnerHTML={{ __html: t('apiKeyInstructions2') }} />
        <p dangerouslySetInnerHTML={{ __html: t('apiKeyInstructions3') }} />
      </Modal>
    </>
  );
};

export default Header; 