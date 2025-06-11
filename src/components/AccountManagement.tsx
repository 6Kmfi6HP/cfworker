import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Trash2, Edit, Plus, User, Mail, Globe, Tag, FileText, Eye, EyeOff } from 'lucide-react';
import { Account } from '../types/account';
import { useAccount } from '../contexts/AccountContext';

import AddAccountModal from './AddAccountModal';
import EditAccountModal from './EditAccountModal';

interface AccountManagementProps {
  visible: boolean;
  onClose: () => void;
}

const AccountManagement: React.FC<AccountManagementProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { accounts, deleteAccount, selectedAccount, setSelectedAccount } = useAccount();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});





  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowEditModal(true);
  };

  const handleDelete = async (accountId: string) => {
    if (window.confirm(t('confirmDeleteAccount', 'Are you sure you want to delete this account?'))) {
      try {
        await deleteAccount(accountId);
      } catch (error) {
        console.error('Error deleting account:', error);
        alert(t('errorDeletingAccount', 'Error deleting account'));
      }
    }
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const renderContent = () => {
    if (accounts.length === 0) {
      return (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('noAccountsYet', 'No accounts yet')}
          </h3>
          <p className="text-gray-500 mb-6">
            {t('addFirstAccount', 'Add your first Cloudflare account to get started')}
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('addAccount', 'Add Account')}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {t('accounts', 'Accounts')} ({accounts.length})
          </h3>
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t('addAccount', 'Add Account')}
          </Button>
        </div>
        
        <div className="grid gap-4">
          {accounts.map((account) => (
            <Card 
              key={account.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedAccount?.id === account.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => {
                setSelectedAccount(account);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {account.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(account);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(account.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{account.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-xs">
                      {showPasswords[account.id] 
                        ? account.globalAPIKey 
                        : '••••••••••••••••••••••••••••••••••••••••'
                      }
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePasswordVisibility(account.id);
                      }}
                    >
                      {showPasswords[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {account.accountId && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-xs">{account.accountId}</span>
                    </div>
                  )}
                  
                  {account.tags && account.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-4 h-4 text-gray-400" />
                      {account.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {account.notes && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600 text-xs">{account.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (!visible) return null;

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('accountManagement', 'Account Management')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="pb-6">
            {renderContent()}
          </div>
        </div>

      {/* 编辑账号模态框 */}
      <EditAccountModal 
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAccount(null);
        }}
        account={editingAccount}
      />
      
      {/* 添加账号模态框 */}
      <AddAccountModal 
        visible={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
      </DialogContent>
    </Dialog>
  );
};

export default AccountManagement;