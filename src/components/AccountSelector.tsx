import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, Settings } from 'lucide-react';
import { useAccount } from '../contexts/AccountContext';
import { useTranslation } from 'react-i18next';

interface AccountSelectorProps {
  onManageAccounts?: () => void;
  onAddAccount?: () => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  onManageAccounts,
  onAddAccount,
}) => {
  const { t } = useTranslation();
  const { accounts, currentAccount, setCurrentAccount, loading: _loading } = useAccount();
  const [_dropdownOpen, setDropdownOpen] = useState(false);

  const handleAccountChange = (accountId: string) => {
    const selectedAccount = accounts.find(acc => acc.id === accountId);
    setCurrentAccount(selectedAccount || null);
    setDropdownOpen(false);
  };

  const getAccountDisplayName = (account: any) => {
    return account.name || account.email;
  };

  const getAccountAvatar = (account: any) => {
    const name = getAccountDisplayName(account);
    return name.charAt(0).toUpperCase();
  };

  const selectOptions = accounts
    .filter(account => account.isActive)
    .map(account => ({
      value: account.id,
      label: (
        <div className="flex items-center gap-3 max-w-full overflow-hidden">
          <Avatar className="w-6 h-6 bg-blue-500 flex-shrink-0">
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {getAccountAvatar(account)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
              {getAccountDisplayName(account)}({account.email})
            </div>
            {/* <div style={{ 
              fontSize: '12px', 
              color: '#8c8c8c',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}>
              {account.email}
            </div> */}
          </div>
          {account.tags && account.tags.length > 0 && (
            <div className="flex gap-1 flex-shrink-0 overflow-hidden">
              {account.tags.slice(0, 1).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs font-medium overflow-hidden text-ellipsis">
                  {tag}
                </Badge>
              ))}
              {account.tags.length > 1 && (
                <Badge variant="outline" className="text-xs font-medium min-w-auto">
                  +{account.tags.length - 1}
                </Badge>
              )}
            </div>
          )}
        </div>
      ),
    }));

  return (
    <div className="flex items-center gap-4 p-3 px-5 bg-white/8 rounded-xl backdrop-blur-sm border border-white/15 shadow-lg min-h-14 max-w-full overflow-hidden">
      {/* <UserOutlined style={{ 
        color: '#1890ff', 
        fontSize: '16px',
        flexShrink: 0
      }} /> */}
      
      <Select value={currentAccount?.id || ''} onValueChange={handleAccountChange}>
        <SelectTrigger className="flex-1 max-w-full">
          <SelectValue placeholder={t('selectAccount', 'Select Account')} />
        </SelectTrigger>
        <SelectContent>
          {selectOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          <div className="border-t border-gray-200 p-3 flex gap-2 bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddAccount?.();
              }}
              className="flex-1 h-9 rounded-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('addAccount', 'Add Account')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onManageAccounts?.();
              }}
              className="flex-1 h-9 rounded-md"
            >
              <Settings className="w-4 h-4 mr-2" />
              {t('manage', 'Manage')}
            </Button>
          </div>
        </SelectContent>
      </Select>

      {currentAccount && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          flexShrink: 1,
          minWidth: 0,
          maxWidth: '200px',
          overflow: 'hidden'
        }}>
          {/* <Avatar 
            size="small" 
            style={{ 
              backgroundColor: '#52c41a',
              fontWeight: 600,
              flexShrink: 0,
              width: '28px',
              height: '28px'
            }}
          >
            {getAccountAvatar(currentAccount)}
          </Avatar> */}
          {/* <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start',
            minWidth: 0,
            flex: 1,
            overflow: 'hidden'
          }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: '#fff',
              lineHeight: '1.1',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              maxWidth: '120px'
            }}>
              {getAccountDisplayName(currentAccount)}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.1',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              maxWidth: '120px'
            }}>
              {currentAccount.email}
            </div>
          </div> */}
          {currentAccount.tags && currentAccount.tags.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-medium max-w-[50px] overflow-hidden text-ellipsis whitespace-nowrap px-1 py-0.5"
                  >
                    {currentAccount.tags[0].length > 4 
                      ? currentAccount.tags[0].substring(0, 3) + '...'
                      : currentAccount.tags[0]
                    }
                    {currentAccount.tags.length > 1 && `+${currentAccount.tags.length - 1}`}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {currentAccount.tags.join(', ')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {!currentAccount && accounts.length > 0 && (
        <Button
          variant="default"
          size="default"
          onClick={() => setDropdownOpen(true)}
          className="rounded-lg font-medium h-9 flex-shrink-0"
        >
          {t('selectAccount', 'Select Account')}
        </Button>
      )}

      {accounts.length === 0 && (
        <Button
          variant="default"
          size="default"
          onClick={onAddAccount}
          className="rounded-lg font-medium h-9 flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('addFirstAccount', 'Add First Account')}
        </Button>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onManageAccounts}
              className="p-1 h-auto min-w-0 border-none bg-transparent"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {t('manageAccounts', 'Manage Accounts')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default AccountSelector;