import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../contexts/AccountContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { X, User, Mail, Globe } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Account } from '../types/account';

interface EditAccountModalProps {
  visible: boolean;
  onClose: () => void;
  account: Account | null;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({ visible, onClose, account }) => {
  const { t } = useTranslation();
  const { updateAccount } = useAccount();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    globalAPIKey: '',
    accountId: '',
    tags: '',
    notes: ''
  });

  // 当账号数据变化时更新表单
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        email: account.email || '',
        globalAPIKey: account.globalAPIKey || '',
        accountId: account.accountId || '',
        tags: account.tags ? account.tags.join(', ') : '',
        notes: account.notes || ''
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) return;
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.globalAPIKey.trim()) {
      toast({
        title: t('error'),
        description: t('fillRequiredFields', 'Please fill in all required fields'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const updatedAccount = {
        name: formData.name,
        email: formData.email,
        globalAPIKey: formData.globalAPIKey,
        accountId: formData.accountId,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        notes: formData.notes
      };
      
      await updateAccount(account.id, updatedAccount);
      
      toast({
        title: t('success'),
        description: t('accountUpdated', 'Account updated successfully'),
      });
      
      onClose();
    } catch {
      toast({
        title: t('error'),
        description: t('failedToUpdateAccount', 'Failed to update account'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {t('editAccount', 'Edit Account')}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('accountName', 'Account Name')} *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('accountNamePlaceholder', 'Enter a friendly name for this account')}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('email', 'Email')} *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('emailPlaceholder', 'Cloudflare account email')}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="globalAPIKey">{t('globalAPIKey', 'Global API Key')} *</Label>
            <Input
              id="globalAPIKey"
              type="password"
              value={formData.globalAPIKey}
              onChange={(e) => handleInputChange('globalAPIKey', e.target.value)}
              placeholder={t('globalAPIKeyPlaceholder', 'Your Cloudflare Global API Key')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountId">{t('accountId', 'Account ID')} ({t('optional', 'Optional')})</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="accountId"
                value={formData.accountId}
                onChange={(e) => handleInputChange('accountId', e.target.value)}
                placeholder={t('accountIdPlaceholder', 'Cloudflare Account ID')}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">{t('tags', 'Tags')} ({t('optional', 'Optional')})</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder={t('tagsPlaceholder', 'Add tags to organize accounts (comma separated)')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">{t('notes', 'Notes')} ({t('optional', 'Optional')})</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t('notesPlaceholder', 'Additional notes about this account')}
              rows={4}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t('cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : null}
              {loading ? t('updating', 'Updating...') : t('update', 'Update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAccountModal;