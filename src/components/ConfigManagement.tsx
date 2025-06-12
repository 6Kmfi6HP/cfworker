import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileDown, FileUp, Download, Upload, FileText, AlertTriangle } from 'lucide-react';
import { useAccount } from '../contexts/AccountContext';
import { toast } from 'sonner';

interface ConfigManagementProps {
  open: boolean;
  onClose: () => void;
}

interface ImportPreview {
  accounts: any[];
  settings: {
    theme?: string;
    language?: string;
    formData?: any;
  };
}

const ConfigManagement: React.FC<ConfigManagementProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { accounts, addAccount } = useAccount();
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);

  const handleExport = () => {
    try {
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        accounts: accounts.map(account => ({
          ...account,
          apiKey: '[ENCRYPTED]' // 安全考虑，不导出真实API密钥
        })),
        settings: {
          theme: localStorage.getItem('theme') || 'system',
          language: localStorage.getItem('i18nextLng') || 'en',
          formData: JSON.parse(localStorage.getItem('workerFormData') || '{}')
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cfworker-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t('exportSuccess', 'Configuration exported successfully'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('exportError', 'Failed to export configuration'));
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // 验证文件格式
      if (!data.accounts || !Array.isArray(data.accounts)) {
        throw new Error('Invalid configuration file format');
      }

      setImportPreview({
        accounts: data.accounts,
        settings: data.settings || {}
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(t('invalidConfigFile', 'Invalid configuration file'));
    }
  };

  const handleImport = async () => {
    if (!importPreview) return;

    setImporting(true);
    try {
      // 导入账户
      for (const account of importPreview.accounts) {
        if (account.apiKey !== '[ENCRYPTED]') {
          await addAccount({
            ...account,
            id: undefined // 让系统生成新的ID
          });
        }
      }

      // 导入设置
      if (importPreview.settings.theme) {
        localStorage.setItem('theme', importPreview.settings.theme);
      }
      if (importPreview.settings.language) {
        localStorage.setItem('i18nextLng', importPreview.settings.language);
      }
      if (importPreview.settings.formData) {
        localStorage.setItem('workerFormData', JSON.stringify(importPreview.settings.formData));
      }

      toast.success(t('importSuccess', 'Configuration imported successfully'));
      setImportPreview(null);
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(t('importError', 'Failed to import configuration'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('configManagement', 'Configuration Management')}</DialogTitle>
          <DialogDescription>
            {t('configManagementDescription', 'Manage your application configuration, export settings for backup, or import from previous configurations.')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* 导出配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5" />
                {t('exportConfig', 'Export Configuration')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('exportConfigDescription', 'Export your accounts and settings to a JSON file for backup or migration.')}
              </p>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{t('exportSecurityNote', 'Security Note')}:</strong> {t('exportSecurityDescription', 'Sensitive data (API keys) will be marked as [ENCRYPTED] in the export file for security reasons.')}
                </AlertDescription>
              </Alert>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleExport}
                  disabled={accounts.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('exportNow', 'Export Now')}
                </Button>
                {accounts.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    {t('noAccountsToExport', 'No accounts to export')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* 导入配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                {t('importConfig', 'Import Configuration')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('importConfigDescription', 'Import accounts and settings from a previously exported JSON file.')}
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                   onClick={() => {
                     const input = document.createElement('input');
                     input.type = 'file';
                     input.accept = '.json';
                     input.onchange = (e) => {
                       const file = (e.target as HTMLInputElement).files?.[0];
                       if (file) handleFileUpload(file as any);
                     };
                     input.click();
                   }}>
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-base font-medium mb-2">
                  {t('clickOrDragToUpload', 'Click or drag configuration file to this area to upload')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('supportJsonFiles', 'Support for JSON configuration files only')}
                </p>
              </div>

              {importPreview && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                      {t('importPreview', 'Import Preview')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">{t('accounts', 'Accounts')} ({importPreview.accounts.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {importPreview.accounts.map((account, index) => (
                            <Badge key={index} variant="outline">
                              {account.name || `Account ${index + 1}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">{t('settings', 'Settings')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {importPreview.settings.theme && <Badge variant="outline">{t('theme', 'Theme')}: {importPreview.settings.theme}</Badge>}
                          {importPreview.settings.language && <Badge variant="outline">{t('language', 'Language')}: {importPreview.settings.language}</Badge>}
                          {importPreview.settings.formData && <Badge variant="outline">{t('formData', 'Form Data')}</Badge>}
                        </div>
                      </div>
                    </div>
                    
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{t('importWarning', 'Import Warning')}:</strong> {t('importWarningDescription', 'Importing will add new accounts and overwrite current settings. This action cannot be undone.')}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={handleImport}
                        disabled={importing}
                        className="flex items-center gap-2 flex-1 min-w-[120px] max-w-[160px]"
                      >
                        {importing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {t('confirmImport', 'Confirm Import')}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setImportPreview(null)}
                        className="flex-1 min-w-[80px] max-w-[120px]"
                      >
                        {t('cancel', 'Cancel')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigManagement;