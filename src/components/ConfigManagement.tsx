import React, { useState } from 'react';
import { Account } from '../types/account';
import { useTranslation } from 'react-i18next';
import { Download, Upload, FileText, AlertTriangle } from 'lucide-react';
import { useAccount } from '../contexts/AccountContext';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../hooks/use-toast';
import { Separator } from './ui/separator';

interface ConfigData {
  version: string;
  exportDate: string;
  accounts: Account[];
  settings: {
    theme: string;
    language: string;
    formData?: Record<string, unknown>;
  };
}

interface ConfigManagementProps {
  visible: boolean;
  onClose: () => void;
}

const ConfigManagement: React.FC<ConfigManagementProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { accounts, addAccount } = useAccount();
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ConfigData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showReloadDialog, setShowReloadDialog] = useState(false);

  const handleExport = () => {
    try {
      const configData: ConfigData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        accounts: accounts.map(account => ({
          ...account,
          globalAPIKey: '[ENCRYPTED]',
          accountId: account.accountId ? '[ENCRYPTED]' : undefined,
        })),
        settings: {
          theme: localStorage.getItem('theme') || 'light',
          language: localStorage.getItem('i18nextLng') || 'en',
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

      toast({
        title: t('configExportSuccess'),
        description: t('configExportSuccessDesc'),
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: t('configExportFailed'),
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const configData = JSON.parse(e.target?.result as string);
        
        if (!configData.version || !configData.accounts || !Array.isArray(configData.accounts)) {
          throw new Error('Invalid configuration file format');
        }

        setImportPreview(configData);
        toast({
          title: t('configFileLoaded'),
          description: t('configFileLoadedDesc'),
        });
      } catch (error) {
        console.error('Failed to parse config file:', error);
        toast({
          title: t('configFileInvalid'),
          variant: 'destructive',
        });
        setImportPreview(null);
        setFileName(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importPreview) return;

    setImporting(true);
    try {
      const accountsToImport = importPreview.accounts.filter(account => 
        account.globalAPIKey !== '[ENCRYPTED]'
      );

      if (accountsToImport.length === 0) {
        toast({
          title: t('noValidAccountsToImport'),
        });
        return;
      }

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

      if (importPreview.settings) {
        if (importPreview.settings.theme) localStorage.setItem('theme', importPreview.settings.theme);
        if (importPreview.settings.language) localStorage.setItem('i18nextLng', importPreview.settings.language);
        if (importPreview.settings.formData) localStorage.setItem('cfWorkerFormData', JSON.stringify(importPreview.settings.formData));
      }

      toast({
        title: t('configImportSuccess'),
        description: t('configImportSuccessDesc'),
      });
      setImportPreview(null);
      setFileName(null);
      onClose();
      
      setShowReloadDialog(true);
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: t('configImportFailed'),
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <React.Fragment>
      <Dialog open={visible} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('configManagement')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {t('exportConfig')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('exportConfigDescription')}
                </p>
                <Alert variant="default">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('exportSecurityNote')}</AlertTitle>
                  <AlertDescription>
                    {t('exportSecurityDescription')}
                  </AlertDescription>
                </Alert>
                <Button onClick={handleExport} disabled={accounts.length === 0} className="mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  {t('exportNow')}
                </Button>
              </CardContent>
            </Card>

            <Separator />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {t('importConfig')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('importConfigDescription')}
                </p>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className="w-8 h-8 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        {fileName || t('clickOrDragToUpload')}
                      </p>
                      <p className="text-xs text-muted-foreground">{t('supportJsonFiles')}</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
                  </label>
                </div>

                {importPreview && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-base">{t('importPreview')}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>{t('configVersion')}: <span className="font-mono">{importPreview.version}</span></p>
                      <p>{t('exportDate')}: <span className="font-mono">{new Date(importPreview.exportDate).toLocaleString()}</span></p>
                      <p>{t('accountsCount')}: <span className="font-semibold">{importPreview.accounts.length}</span></p>
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t('importWarning')}</AlertTitle>
                        <AlertDescription>{t('importWarningDescription')}</AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            {importPreview && (
              <Button onClick={handleImport} disabled={importing}>
                {importing ? t('importing') : t('confirmImport')}
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline">{t('close')}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showReloadDialog} onOpenChange={setShowReloadDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('importComplete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('refreshPageContent')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('later')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => window.location.reload()}>{t('refreshNow')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </React.Fragment>
  );
};

export default ConfigManagement;