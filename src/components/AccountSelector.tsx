import React, { useState } from 'react';
import { Select, Button, Tag, Tooltip, Avatar } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
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
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          // padding: '4px 0',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <Avatar size="small" style={{ backgroundColor: '#1890ff', flexShrink: 0 }}>
            {getAccountAvatar(account)}
          </Avatar>
          <div style={{ 
            flex: 1, 
            minWidth: 0,
            // maxWidth: 'calc(100% - 120px)' // Reserve space for avatar and tags
          }}>
            <div style={{ 
              fontWeight: 500, 
              fontSize: '14px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}>
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
            <div style={{ 
              display: 'flex', 
              gap: '4px', 
              flexShrink: 0,
              // maxWidth: '80px',
              overflow: 'hidden'
            }}>
              {account.tags.slice(0, 1).map((tag: string) => (
                <Tag key={tag} color="blue" style={{ 
                  fontSize: '11px', 
                  margin: 0,
                  // maxWidth: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {tag}
                </Tag>
              ))}
              {account.tags.length > 1 && (
                <Tag color="default" style={{ 
                  fontSize: '11px', 
                  margin: 0,
                  minWidth: 'auto'
                }}>
                  +{account.tags.length - 1}
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
      gap: '16px',
      padding: '12px 20px',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      minHeight: '56px',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* <UserOutlined style={{ 
        color: '#1890ff', 
        fontSize: '16px',
        flexShrink: 0
      }} /> */}
      
      <Select
        style={{ 
          // minWidth: '200px', 
          flex: 1,
          maxWidth: '100%'
        }}
        placeholder={t('selectAccount', 'Select Account')}
        value={currentAccount?.id}
        onChange={handleAccountChange}
        loading={loading}
        open={dropdownOpen}
        onDropdownVisibleChange={setDropdownOpen}
        options={selectOptions}
        optionRender={(option) => option.label}
        size="large"
        dropdownRender={(menu) => (
          <div>
            {menu}
            <div style={{ 
              borderTop: '1px solid #f0f0f0', 
              padding: '12px',
              display: 'flex',
              gap: '8px',
              backgroundColor: '#fafafa'
            }}>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => {
                  setDropdownOpen(false);
                  onAddAccount?.();
                }}
                style={{ 
                  flex: 1,
                  height: '36px',
                  borderRadius: '6px'
                }}
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
                style={{ 
                  flex: 1,
                  height: '36px',
                  borderRadius: '6px'
                }}
              >
                {t('manage', 'Manage')}
              </Button>
            </div>
          </div>
        )}
      />

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
            <Tooltip title={currentAccount.tags.join(', ')}>
              <Tag 
                color="green" 
                style={{ 
                  fontSize: '10px',
                  margin: 0,
                  borderRadius: '3px',
                  fontWeight: 500,
                  flexShrink: 0,
                  maxWidth: '50px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '1px 4px',
                  lineHeight: '1.2'
                }}
              >
                {currentAccount.tags[0].length > 4 
                  ? currentAccount.tags[0].substring(0, 3) + '...'
                  : currentAccount.tags[0]
                }
                {currentAccount.tags.length > 1 && `+${currentAccount.tags.length - 1}`}
              </Tag>
            </Tooltip>
          )}
        </div>
      )}

      {!currentAccount && accounts.length > 0 && (
        <Button
          type="primary"
          size="middle"
          onClick={() => setDropdownOpen(true)}
          style={{
            borderRadius: '8px',
            fontWeight: 500,
            height: '36px',
            flexShrink: 0
          }}
        >
          {t('selectAccount', 'Select Account')}
        </Button>
      )}

      {accounts.length === 0 && (
        <Button
          type="primary"
          size="middle"
          icon={<PlusOutlined />}
          onClick={onAddAccount}
          style={{
            borderRadius: '8px',
            fontWeight: 500,
            height: '36px',
            flexShrink: 0
          }}
        >
          {t('addFirstAccount', 'Add First Account')}
        </Button>
      )}
    </div>
  );
};

export default AccountSelector; 