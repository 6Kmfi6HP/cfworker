import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { useAccount } from '../contexts/AccountContext';
import { useTranslation } from 'react-i18next';
import { Account } from '../types/account';


import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';

interface AccountSelectorProps {
  onManageAccounts?: () => void;
  onAddAccount?: () => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  onManageAccounts,
  onAddAccount,
}) => {
  const { t } = useTranslation();
  const { accounts, currentAccount, setCurrentAccount, loading } = useAccount();

  const handleAccountChange = (accountId: string) => {
    const selectedAccount = accounts.find(acc => acc.id === accountId);
    setCurrentAccount(selectedAccount || null);
  };

  const getAccountDisplayName = (account: Account) => {
    return account.name || account.email;
  };

  const getAccountAvatar = (account: Account) => {
    const name = getAccountDisplayName(account);
    return name.charAt(0).toUpperCase();
  };

  const activeAccounts = accounts.filter(account => account.isActive);

  return (
    <div className="flex items-center gap-4 p-3 bg-background/80 backdrop-blur-sm border rounded-lg shadow-sm w-full">
      <Select
        value={currentAccount?.id || ''}
        onValueChange={handleAccountChange}
        disabled={loading || activeAccounts.length === 0}
      >
        <SelectTrigger className="flex-1 min-w-0 text-base h-11">
          <SelectValue placeholder={t('selectAccount', 'Select Account')}>
            {currentAccount ? (
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getAccountAvatar(currentAccount)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{getAccountDisplayName(currentAccount)}</p>
                </div>
              </div>
            ) : (
              t('selectAccount', 'Select Account')
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t('accounts')}</SelectLabel>
            {activeAccounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/80 text-primary-foreground text-xs">
                      {getAccountAvatar(account)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{getAccountDisplayName(account)}</p>
                    <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                  </div>
                  {account.tags && account.tags.length > 0 && (
                    <div className="flex gap-1 flex-shrink-0">
                      {account.tags.slice(0, 1).map((tag: string) => (
                        <TooltipProvider key={tag}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary" className="max-w-[50px] truncate">{tag}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{tag}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                      {account.tags.length > 1 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline">+{account.tags.length - 1}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{account.tags.slice(1).join(', ')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          <Separator className="my-1" />
          <div className="p-2 flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" className="w-full justify-start" onClick={onAddAccount}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addAccount')}
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={onManageAccounts}>
              <Settings className="mr-2 h-4 w-4" />
              {t('manage')}
            </Button>
          </div>
        </SelectContent>
      </Select>

      {accounts.length === 0 && !loading && (
        <Button onClick={onAddAccount} className="flex-shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          {t('addFirstAccount')}
        </Button>
      )}
    </div>
  );
};

export default AccountSelector;