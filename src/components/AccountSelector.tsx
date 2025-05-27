import React, { useState } from 'react';
import { Select, Button, Tag, Tooltip, Avatar } from 'antd';
import { UserOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
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
  const { accounts, currentAccount, setCurrentAccount, loading } = useAccount();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            {getAccountAvatar(account)}
          </Avatar>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{getAccountDisplayName(account)}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{account.email}</div>
          </div>
          {account.tags && account.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {account.tags.slice(0, 2).map((tag: string) => (
                <Tag key={tag} color="blue" style={{ fontSize: '12px' }}>
                  {tag}
                </Tag>
              ))}
              {account.tags.length > 2 && (
                <Tag color="default" style={{ fontSize: '12px' }}>
                  +{account.tags.length - 2}
                </Tag>
              )}
            </div>
          )}
        </div>
      ),
    }));

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      padding: '8px 16px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }}>
      <UserOutlined style={{ color: '#1890ff' }} />
      
      <Select
        style={{ minWidth: '200px', flex: 1 }}
        placeholder={t('selectAccount', 'Select Account')}
        value={currentAccount?.id}
        onChange={handleAccountChange}
        loading={loading}
        open={dropdownOpen}
        onDropdownVisibleChange={setDropdownOpen}
        options={selectOptions}
        optionRender={(option) => option.label}
        dropdownRender={(menu) => (
          <div>
            {menu}
            <div style={{ 
              borderTop: '1px solid #f0f0f0', 
              padding: '8px',
              display: 'flex',
              gap: '8px'
            }}>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => {
                  setDropdownOpen(false);
                  onAddAccount?.();
                }}
                style={{ flex: 1 }}
              >
                {t('addAccount', 'Add Account')}
              </Button>
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => {
                  setDropdownOpen(false);
                  onManageAccounts?.();
                }}
                style={{ flex: 1 }}
              >
                {t('manage', 'Manage')}
              </Button>
            </div>
          </div>
        )}
      />

      {currentAccount && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" style={{ backgroundColor: '#52c41a' }}>
            {getAccountAvatar(currentAccount)}
          </Avatar>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>
              {getAccountDisplayName(currentAccount)}
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              {currentAccount.email}
            </span>
          </div>
          {currentAccount.tags && currentAccount.tags.length > 0 && (
                         <Tooltip title={currentAccount.tags.join(', ')}>
               <Tag color="green" style={{ fontSize: '12px' }}>
                 {currentAccount.tags[0]}
                 {currentAccount.tags.length > 1 && ` +${currentAccount.tags.length - 1}`}
               </Tag>
             </Tooltip>
          )}
        </div>
      )}

      {!currentAccount && accounts.length > 0 && (
        <Button
          type="primary"
          size="small"
          onClick={() => setDropdownOpen(true)}
        >
          {t('selectAccount', 'Select Account')}
        </Button>
      )}

      {accounts.length === 0 && (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={onAddAccount}
        >
          {t('addFirstAccount', 'Add First Account')}
        </Button>
      )}
    </div>
  );
};

export default AccountSelector; 