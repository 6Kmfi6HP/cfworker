import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { AccountProvider } from './contexts/AccountContext';
import { ThemeProvider } from './ThemeContext';
import { Helmet } from 'react-helmet-async';

// Components
import Header from './components/Header';
import WorkerForm from './components/WorkerForm';
import NodeOutput from './components/NodeOutput';
import AccountManagement from './components/AccountManagement';
import AddAccountModal from './components/AddAccountModal';
import BulkWorkerDeployment from './components/BulkWorkerDeployment';
import ConfigManagement from './components/ConfigManagement';
import Footer from './Footer';


function AppContent() {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [node, setNode] = useState(
    "vless://d342d11e-d424-4583-b36e-524ab1f0afa4@www.visa.com.sg:8880?encryption=none&security=none&type=ws&host=a.srps7gic.workers.dev&path=%2F%3Fed%3D2560#worker节点"
  );
  const [url, setUrl] = useState(
    "https://www.cloudflare.com/"
  );
  const [isNodeGenerated, setIsNodeGenerated] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showAccountManagement, setShowAccountManagement] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showBulkDeployment, setShowBulkDeployment] = useState(false);
  const [showConfigManagement, setShowConfigManagement] = useState(false);
  
  const { t } = useTranslation();

  // Load saved language on component mount
  useEffect(() => {
    // Load saved language or use browser language
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    } else {
      const browserLang = navigator.language.split('-')[0];
      const supportedLang = ['en', 'zh'].includes(browserLang) ? browserLang : 'en';
      setSelectedLanguage(supportedLang);
      i18n.changeLanguage(supportedLang);
    }
  }, []);

  // Set document title
  useEffect(() => {
    document.title = "CF Worker VLESS 节点搭建";
  }, []);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    i18n.changeLanguage(value);
    localStorage.setItem('selectedLanguage', value);
  };



  const handleWorkerCreated = (nodeData: string, urlData: string) => {
    setNode(nodeData);
    setUrl(urlData);
    setIsNodeGenerated(true);
    setShowShareModal(true);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Helmet>
        <title>{t('title')} | Easy Cloudflare Worker Management</title>
        <meta name="description" content={t('metaDescription')} />
        <meta property="og:title" content={`${t('title')} | Easy Cloudflare Worker Management`} />
        <meta property="og:description" content={t('metaDescription')} />
        <meta name="twitter:title" content={`${t('title')} | Easy Cloudflare Worker Management`} />
        <meta name="twitter:description" content={t('metaDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Helmet>

      <Header
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        onShowAccountManagement={() => setShowAccountManagement(true)}
        onShowAddAccount={() => setShowAddAccountModal(true)}
        showApiKeyModal={showApiKeyModal}
        onCloseApiKeyModal={() => setShowApiKeyModal(false)}
        onShowApiKeyModal={() => setShowApiKeyModal(true)}
      />

      <WorkerForm
        onWorkerCreated={handleWorkerCreated}
        onShowBulkDeployment={() => setShowBulkDeployment(true)}
        onShowConfigManagement={() => setShowConfigManagement(true)}
      />

      <NodeOutput
        node={node}
        url={url}
        isNodeGenerated={isNodeGenerated}
        showShareModal={showShareModal}
        onCloseShareModal={() => setShowShareModal(false)}
        setShowShareModal={setShowShareModal}
      />

      <Footer />

      {/* Account Management Modal */}
      <AccountManagement
        visible={showAccountManagement}
        onClose={() => setShowAccountManagement(false)}
      />

      {/* Add Account Modal */}
      <AddAccountModal
        visible={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
      />

      {/* Bulk Worker Deployment Modal */}
      <BulkWorkerDeployment
        visible={showBulkDeployment}
        onClose={() => setShowBulkDeployment(false)}
      />

      {/* Configuration Management Modal */}
      <ConfigManagement
        visible={showConfigManagement}
        onClose={() => setShowConfigManagement(false)}
      />

      {/* Global Shortcuts */}
      {/* <GlobalShortcuts
        onOpenAccountManagement={() => setShowAccountManagement(true)}
        onOpenBulkDeployment={() => setShowBulkDeployment(true)}
        onOpenConfigManagement={() => setShowConfigManagement(true)}
        onToggleTheme={handleToggleTheme}
        onToggleLanguage={handleToggleLanguage}
      /> */}
    </div>
  );
}

// 使用 ThemeProvider 和 AccountProvider 包装 App 组件
const App = () => (
  <AccountProvider>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </AccountProvider>
);

// Export App as the default export
export default App;
