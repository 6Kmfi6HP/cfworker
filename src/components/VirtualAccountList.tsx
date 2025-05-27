import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Avatar, Tag, Typography, Space, Button, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { AccountCredentials } from '../types/account';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface VirtualAccountListProps {
  accounts: AccountCredentials[];
  currentAccount: AccountCredentials | null;
  onEdit: (account: AccountCredentials) => void;
  onDelete: (accountId: string) => void;
  onSetCurrent: (account: AccountCredentials) => void;
  height?: number;
}

interface ItemData {
  accounts: AccountCredentials[];
  currentAccount: AccountCredentials | null;
  onEdit: (account: AccountCredentials) => void;
  onDelete: (accountId: string) => void;
  onSetCurrent: (account: AccountCredentials) => void;
  t: any;
}

const AccountItem: React.FC<{ index: number; style: any; data: ItemData }> = ({ index, style, data }) => {
  const { accounts, currentAccount, onEdit, onDelete, onSetCurrent, t } = data;
  const account = accounts[index];

  const getAccountDisplayName = (account: AccountCredentials) => {
    return account.name || account.email;
  };

  return (
    <div style={style}>
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: account.id === currentAccount?.id ? '#f6ffed' : 'transparent',
          borderLeft: account.id === currentAccount?.id ? '3px solid #52c41a' : '3px solid transparent',
        }}
      >
        {/* Avatar and Account Info */}
        <Avatar style={{ backgroundColor: '#1890ff', flexShrink: 0 }}>
          {getAccountDisplayName(account).charAt(0).toUpperCase()}
        </Avatar>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Text strong style={{ fontSize: '14px' }}>
              {getAccountDisplayName(account)}
            </Text>
                         {account.id === currentAccount?.id && (
               <Tag color="green">
                 {t('current', 'Current')}
               </Tag>
             )}
          </div>
          
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
            {account.email}
          </Text>
          
                     {/* Tags */}
           <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px' }}>
             {account.tags && account.tags.length > 0 ? (
               account.tags.slice(0, 3).map((tag) => (
                 <Tag key={tag} color="blue" style={{ fontSize: '10px' }}>
                   {tag}
                 </Tag>
               ))
             ) : null}
             {account.tags && account.tags.length > 3 && (
               <Tag style={{ fontSize: '10px' }}>
                 +{account.tags.length - 3}
               </Tag>
             )}
           </div>
           
           {/* Status and Date */}
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Tag 
               color={account.isActive ? 'green' : 'red'} 
               icon={account.isActive ? <CheckCircleOutlined /> : <StopOutlined />}
             >
               {account.isActive ? t('active', 'Active') : t('inactive', 'Inactive')}
             </Tag>
            <Tooltip title={new Date(account.createdAt).toLocaleString()}>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {new Date(account.createdAt).toLocaleDateString()}
              </Text>
            </Tooltip>
          </div>
        </div>
        
        {/* Actions */}
        <Space size="small" style={{ flexShrink: 0 }}>
          {account.id !== currentAccount?.id && (
            <Button
              type="text"
              size="small"
              onClick={() => onSetCurrent(account)}
              style={{ fontSize: '12px' }}
            >
              {t('setCurrent', 'Set Current')}
            </Button>
          )}
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(account)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(account.id)}
          />
        </Space>
      </div>
    </div>
  );
};

const VirtualAccountList: React.FC<VirtualAccountListProps> = ({
  accounts,
  currentAccount,
  onEdit,
  onDelete,
  onSetCurrent,
  height = 400,
}) => {
  const { t } = useTranslation();

  const itemData = useMemo(
    () => ({
      accounts,
      currentAccount,
      onEdit,
      onDelete,
      onSetCurrent,
      t,
    }),
    [accounts, currentAccount, onEdit, onDelete, onSetCurrent, t]
  );

  if (accounts.length === 0) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px',
        }}
      >
        {t('noAccountsFound', 'No accounts found')}
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: '6px', overflow: 'hidden' }}>
      <List
        height={height}
        width="100%"
        itemCount={accounts.length}
        itemSize={120} // 每个账号项的高度
        itemData={itemData}
        overscanCount={5} // 预渲染的项目数量
      >
        {AccountItem}
      </List>
    </div>
  );
};

export default VirtualAccountList; 