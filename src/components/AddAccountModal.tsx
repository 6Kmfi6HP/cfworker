import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../contexts/AccountContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { addAccount } = useAccount();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.globalAPIKey.trim()) {
      toast({
        title: t('error'),
        description: t('apiKeyRequired'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const newAccount = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        isActive: true
      };
      
      await addAccount(newAccount);
      
      toast({
        title: t('success'),
        description: t('accountAdded'),
      });
      
      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        globalAPIKey: '',
        accountId: '',
        tags: '',
        notes: ''
      });
      onClose();
    } catch {
      toast({
        title: t('error'),
        description: t('failedToAddAccount'),
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
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {t('addAccount')}
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
            <Label htmlFor="globalAPIKey">{t('globalAPIKey')} *</Label>
            <Input
              id="globalAPIKey"
              type="password"
              value={formData.globalAPIKey}
              onChange={(e) => handleInputChange('globalAPIKey', e.target.value)}
              placeholder={t('enterGlobalAPIKey')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountId">{t('accountID')} ({t('optional')})</Label>
            <Input
              id="accountId"
              value={formData.accountId}
              onChange={(e) => handleInputChange('accountId', e.target.value)}
              placeholder={t('cloudflareAccountID')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">{t('accountName')} ({t('optional')})</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('enterAccountName')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')} ({t('optional')})</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('enterEmail')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">{t('tags')} ({t('optional')})</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder={t('addTagsToOrganizeAccounts')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">{t('notes')} ({t('optional')})</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t('additionalNotesAboutThis')}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('adding') : t('addAccount')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountModal;