import React, { useState } from 'react';
import {
  Modal,
  Button,
  Space,
  Upload,
  message,
  notification,
  Typography,
  Divider,
  Alert,
  Card,
  Descriptions,
  Tag,
} from 'antd';
import {
  DownloadOutlined,
  UploadOutlined,
  ExportOutlined,
  ImportOutlined,
  FileTextOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useAccount } from '../contexts/AccountContext';
import { useTranslation } from 'react-i18next';
import type { UploadFile } from 'antd/es/upload/interface';

const { Text, Title } = Typography;
const { Dragger } = Upload;

interface ConfigData {
  version: string;
  exportDate: string;
  accounts: any[];
  settings: {
    theme: string;
    language: string;
    formData?: any;
  };
}

interface ConfigManagementProps {
  visible: boolean;
  onClose: () => void;
}

const ConfigManagement: React.FC<ConfigManagementProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { accounts, addAccount } = useAccount();
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ConfigData | null>(null);

  // 导出配置
  const handleExport = () => {
    try {
      const configData: ConfigData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        accounts: accounts.map(account => ({
          ...account,
          // 移除敏感信息，只保留结构
          globalAPIKey: '[ENCRYPTED]',
          accountId: account.accountId ? '[ENCRYPTED]' : undefined,
        })),
        settings: {
          theme: localStorage.getItem('theme') || 'light',
          language: localStorage.getItem('selectedLanguage') || 'en',
          formData: JSON.parse(localStorage.getItem('cfWorkerFormData') || '{}'),
        },
      };

      const dataStr = JSON.stringify(configData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cfworker-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notification.success({
        message: t('configExportSuccess', 'Configuration exported successfully'),
        description: t('configExportSuccessDesc', 'Configuration file has been downloaded to your device.'),
        placement: 'topRight',
        duration: 3,
      });
    } catch (error) {
      console.error('Export failed:', error);
      message.error(t('configExportFailed', 'Failed to export configuration'));
    }
  };

  // 预览导入文件
  const handleFileUpload = (file: UploadFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const configData = JSON.parse(e.target?.result as string);
        
        // 验证配置文件格式
        if (!configData.version || !configData.accounts || !Array.isArray(configData.accounts)) {
          throw new Error('Invalid configuration file format');
        }

        setImportPreview(configData);
        notification.success({
          message: t('configFileLoaded', 'Configuration file loaded successfully'),
          description: t('configFileLoadedDesc', 'Configuration file has been parsed and is ready for import.'),
          placement: 'topRight',
          duration: 3,
        });
      } catch (error) {
        console.error('Failed to parse config file:', error);
        message.error(t('configFileInvalid', 'Invalid configuration file'));
        setImportPreview(null);
      }
    };
    reader.readAsText(file as any);
    return false; // 阻止自动上传
  };

  // 执行导入
  const handleImport = async () => {
    if (!importPreview) return;

    setImporting(true);
    try {
      // 导入账号（需要用户重新输入敏感信息）
      const accountsToImport = importPreview.accounts.filter(account => 
        account.globalAPIKey !== '[ENCRYPTED]'
      );

      if (accountsToImport.length === 0) {
        message.warning(t('noValidAccountsToImport', 'No valid accounts to import. Please ensure sensitive data is included.'));
        return;
      }

      // 批量添加账号
      for (const accountData of accountsToImport) {
        try {
          await addAccount({
            name: accountData.name,
            email: accountData.email,
            globalAPIKey: accountData.globalAPIKey,
            accountId: accountData.accountId,
            tags: accountData.tags,
            notes: accountData.notes,
          });
        } catch (error) {
          console.error(`Failed to import account ${accountData.email}:`, error);
        }
      }

      // 导入设置
      if (importPreview.settings) {
        if (importPreview.settings.theme) {
          localStorage.setItem('theme', importPreview.settings.theme);
        }
        if (importPreview.settings.language) {
          localStorage.setItem('selectedLanguage', importPreview.settings.language);
        }
        if (importPreview.settings.formData) {
          localStorage.setItem('cfWorkerFormData', JSON.stringify(importPreview.settings.formData));
        }
      }

      notification.success({
        message: t('configImportSuccess', 'Configuration imported successfully'),
        description: t('configImportSuccessDesc', 'All configuration data has been imported successfully.'),
        placement: 'topRight',
        duration: 4,
      });
      setImportPreview(null);
      onClose();
      
      // 建议用户刷新页面以应用所有设置
      Modal.confirm({
        title: t('refreshPageTitle', 'Refresh Page'),
        content: t('refreshPageContent', 'To apply all imported settings, please refresh the page.'),
        okText: t('refresh', 'Refresh'),
        cancelText: t('later', 'Later'),
        onOk: () => window.location.reload(),
      });
    } catch (error) {
      console.error('Import failed:', error);
      message.error(t('configImportFailed', 'Failed to import configuration'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      title={t('configManagement', 'Configuration Management')}
      open={visible}
      onCancel={onClose}
      width={700}
      footer={null}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 导出配置 */}
        <Card>
          <Title level={5}>
            <ExportOutlined style={{ marginRight: 8 }} />
            {t('exportConfig', 'Export Configuration')}
          </Title>
          <Text type="secondary">
            {t('exportConfigDescription', 'Export your accounts and settings to a JSON file for backup or migration.')}
          </Text>
          <br />
          <Alert
            message={t('exportSecurityNote', 'Security Note')}
            description={t('exportSecurityDescription', 'Sensitive data (API keys) will be marked as [ENCRYPTED] in the export file for security reasons.')}
            type="warning"
            showIcon
            style={{ margin: '16px 0' }}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            disabled={accounts.length === 0}
          >
            {t('exportNow', 'Export Now')}
          </Button>
          {accounts.length === 0 && (
            <Text type="secondary" style={{ marginLeft: 8 }}>
              {t('noAccountsToExport', 'No accounts to export')}
            </Text>
          )}
        </Card>

        <Divider />

        {/* 导入配置 */}
        <Card>
          <Title level={5}>
            <ImportOutlined style={{ marginRight: 8 }} />
            {t('importConfig', 'Import Configuration')}
          </Title>
          <Text type="secondary">
            {t('importConfigDescription', 'Import accounts and settings from a previously exported JSON file.')}
          </Text>
          
          <div style={{ margin: '16px 0' }}>
            <Dragger
              accept=".json"
              beforeUpload={handleFileUpload}
              showUploadList={false}
              style={{ padding: '20px' }}
            >
              <p className="ant-upload-drag-icon">
                <FileTextOutlined />
              </p>
              <p className="ant-upload-text">
                {t('clickOrDragToUpload', 'Click or drag configuration file to this area to upload')}
              </p>
              <p className="ant-upload-hint">
                {t('supportJsonFiles', 'Support for JSON configuration files only')}
              </p>
            </Dragger>
          </div>

          {importPreview && (
            <Card size="small" style={{ marginTop: 16 }}>
              <Title level={5}>
                <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                {t('importPreview', 'Import Preview')}
              </Title>
              <Descriptions size="small" column={1}>
                <Descriptions.Item label={t('configVersion', 'Version')}>
                  {importPreview.version}
                </Descriptions.Item>
                <Descriptions.Item label={t('exportDate', 'Export Date')}>
                  {new Date(importPreview.exportDate).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label={t('accountsCount', 'Accounts')}>
                  <Space>
                    <Tag color="blue">{importPreview.accounts.length} {t('total', 'total')}</Tag>
                    <Tag color="green">
                      {importPreview.accounts.filter(acc => acc.globalAPIKey !== '[ENCRYPTED]').length} {t('importable', 'importable')}
                    </Tag>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('settings', 'Settings')}>
                  <Space>
                    {importPreview.settings.theme && <Tag>{t('theme', 'Theme')}: {importPreview.settings.theme}</Tag>}
                    {importPreview.settings.language && <Tag>{t('language', 'Language')}: {importPreview.settings.language}</Tag>}
                    {importPreview.settings.formData && <Tag>{t('formData', 'Form Data')}</Tag>}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
              
              <Alert
                message={t('importWarning', 'Import Warning')}
                description={t('importWarningDescription', 'Importing will add new accounts and overwrite current settings. This action cannot be undone.')}
                type="warning"
                showIcon
                style={{ margin: '16px 0' }}
              />
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                justifyContent: 'flex-start'
              }}>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={handleImport}
                  loading={importing}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '120px',
                    maxWidth: '160px'
                  }}
                >
                  {t('confirmImport', 'Confirm Import')}
                </Button>
                <Button 
                  onClick={() => setImportPreview(null)}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '80px',
                    maxWidth: '120px'
                  }}
                >
                  {t('cancel', 'Cancel')}
                </Button>
              </div>
            </Card>
          )}
        </Card>
      </Space>
    </Modal>
  );
};

export default ConfigManagement; 