import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Popconfirm,
  message,
  notification,
  Avatar,
  Tooltip,
  Typography,
  Skeleton,
  Card,
  Row,
  Col,
  Badge,
  Divider,
  Empty,
  Drawer,
  Dropdown,
  Menu,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  MoreOutlined,
  StarOutlined,
  StarFilled,
  SettingOutlined,
  EyeOutlined,
  CopyOutlined,
  GlobalOutlined,
  MailOutlined,
  TagsOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useAccount } from '../contexts/AccountContext';
import { AccountFormData, AccountCredentials } from '../types/account';
import { useTranslation } from 'react-i18next';
import './AccountManagement.css';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Search } = Input;

interface AccountManagementProps {
  visible: boolean;
  onClose: () => void;
}

const AccountManagement: React.FC<AccountManagementProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { 
    accounts, 
    addAccount, 
    updateAccount, 
    deleteAccount, 
    currentAccount, 
    setCurrentAccount, 
    loading: accountsLoading 
  } = useAccount();
  
  const [form] = Form.useForm();
  const [editingAccount, setEditingAccount] = useState<AccountCredentials | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'status'>('name');
  const [favoriteAccounts, setFavoriteAccounts] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // 检测屏幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 加载收藏账号
  useEffect(() => {
    const saved = localStorage.getItem('favoriteAccounts');
    if (saved) {
      setFavoriteAccounts(new Set(JSON.parse(saved)));
    }
  }, []);

  const handleAddAccount = () => {
    setEditingAccount(null);
    form.resetFields();
    setShowForm(true);
  };

  const handleEditAccount = (account: AccountCredentials) => {
    setEditingAccount(account);
    form.setFieldsValue({
      name: account.name,
      email: account.email,
      globalAPIKey: account.globalAPIKey,
      accountId: account.accountId,
      tags: account.tags || [],
      notes: account.notes,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const formData: AccountFormData = {
        ...values,
        tags: values.tags || [],
      };

      if (editingAccount) {
        await updateAccount(editingAccount.id, formData);
        notification.success({
          message: t('accountUpdated', 'Account updated successfully'),
          description: t('accountUpdatedDesc', 'Account information has been updated.'),
          placement: 'topRight',
          duration: 3,
        });
      } else {
        await addAccount(formData);
        notification.success({
          message: t('accountAdded', 'Account added successfully'),
          description: t('accountAddedDesc', 'New account has been added to your list.'),
          placement: 'topRight',
          duration: 3,
        });
      }

      setShowForm(false);
      form.resetFields();
      setEditingAccount(null);
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccount(accountId);
      notification.success({
        message: t('accountDeleted', 'Account deleted successfully'),
        description: t('accountDeletedDesc', 'Account has been removed from your list.'),
        placement: 'topRight',
        duration: 3,
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      message.error(t('deleteAccountError', 'Failed to delete account'));
    }
  };

  const handleSetCurrent = (account: AccountCredentials) => {
    setCurrentAccount(account);
    notification.success({
      message: t('accountSetAsCurrent', 'Account set as current'),
      description: t('accountSetAsCurrentDesc', `Now using ${account.name || account.email} as the active account.`),
      placement: 'topRight',
      duration: 3,
    });
  };

  const toggleFavorite = (accountId: string) => {
    const newFavorites = new Set(favoriteAccounts);
    if (newFavorites.has(accountId)) {
      newFavorites.delete(accountId);
    } else {
      newFavorites.add(accountId);
    }
    setFavoriteAccounts(newFavorites);
    localStorage.setItem('favoriteAccounts', JSON.stringify([...newFavorites]));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    notification.success({
      message: t('copied', `${type} copied to clipboard`),
      description: t('copiedDesc', 'Content has been copied to your clipboard.'),
      placement: 'topRight',
      duration: 2,
    });
  };

  const getAccountDisplayName = (account: AccountCredentials) => {
    return account.name || account.email;
  };

  // 过滤和排序账号
  const filteredAndSortedAccounts = accounts
    .filter(account => {
      const matchesSearch = getAccountDisplayName(account)
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
        account.email.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesTag = !filterTag || (account.tags && account.tags.includes(filterTag));
      
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return getAccountDisplayName(a).localeCompare(getAccountDisplayName(b));
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'status':
          return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
        default:
          return 0;
      }
    });

  // 获取所有标签
  const allTags = [...new Set(accounts.flatMap(account => account.tags || []))];

  const renderAccountCard = (account: AccountCredentials) => {
    const isCurrent = account.id === currentAccount?.id;
    const isFavorite = favoriteAccounts.has(account.id);

    const actionMenu = (
      <Menu>
        {!isCurrent && (
          <Menu.Item 
            key="setCurrent" 
            icon={<CheckCircleOutlined />}
            onClick={() => handleSetCurrent(account)}
          >
            {t('setCurrent', 'Set as Current')}
          </Menu.Item>
        )}
        <Menu.Item 
          key="edit" 
          icon={<EditOutlined />}
          onClick={() => handleEditAccount(account)}
        >
          {t('edit', 'Edit')}
        </Menu.Item>
        <Menu.Item 
          key="copyEmail" 
          icon={<CopyOutlined />}
          onClick={() => copyToClipboard(account.email, 'Email')}
        >
          {t('copyEmail', 'Copy Email')}
        </Menu.Item>
        {account.accountId && (
          <Menu.Item 
            key="copyAccountId" 
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(account.accountId!, 'Account ID')}
          >
            {t('copyAccountId', 'Copy Account ID')}
          </Menu.Item>
        )}
        <Menu.Divider />
        <Menu.Item 
          key="delete" 
          icon={<DeleteOutlined />}
          danger
          onClick={() => {
            Modal.confirm({
              title: t('deleteAccountConfirm', 'Are you sure you want to delete this account?'),
              content: t('deleteAccountWarning', 'This action cannot be undone.'),
              onOk: () => handleDeleteAccount(account.id),
              okText: t('delete', 'Delete'),
              cancelText: t('cancel', 'Cancel'),
              okButtonProps: { danger: true },
            });
          }}
        >
          {t('delete', 'Delete')}
        </Menu.Item>
      </Menu>
    );

    return (
      <Card
        key={account.id}
        className={`account-card ${isCurrent ? 'current-account' : ''}`}
        hoverable
        actions={[
          <Tooltip title={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}>
            <Button
              type="text"
              icon={isFavorite ? <StarFilled /> : <StarOutlined />}
              onClick={() => toggleFavorite(account.id)}
              className={isFavorite ? 'favorite-btn active' : 'favorite-btn'}
            />
          </Tooltip>,
          <Tooltip title={t('viewDetails', 'View Details')}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleEditAccount(account)}
            />
          </Tooltip>,
          <Dropdown overlay={actionMenu} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        ]}
      >
        <div className="account-card-header">
          <div className="account-avatar-section">
            <Badge 
              dot 
              status={account.isActive ? 'success' : 'error'}
              offset={[-8, 8]}
            >
              <Avatar 
                size={48}
                style={{ 
                  backgroundColor: isCurrent ? '#52c41a' : '#1890ff',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                {getAccountDisplayName(account).charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
          </div>
          
          <div className="account-info">
            <div className="account-name">
              <Text strong style={{ fontSize: '16px' }}>
                {getAccountDisplayName(account)}
              </Text>
              {isCurrent && (
                <Tag color="green" style={{ marginLeft: '8px' }}>
                  {t('current', 'Current')}
                </Tag>
              )}
            </div>
            
            <div className="account-email">
              <MailOutlined style={{ marginRight: '4px', color: '#8c8c8c' }} />
              <Text type="secondary" style={{ fontSize: '13px' }}>
                {account.email}
              </Text>
            </div>
            
            {account.accountId && (
              <div className="account-id">
                <GlobalOutlined style={{ marginRight: '4px', color: '#8c8c8c' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {account.accountId.substring(0, 8)}...
                </Text>
              </div>
            )}
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div className="account-meta">
          <div className="account-tags">
            {account.tags && account.tags.length > 0 ? (
              <div style={{ marginBottom: '8px' }}>
                <TagsOutlined style={{ marginRight: '4px', color: '#8c8c8c' }} />
                                 {account.tags.slice(0, 3).map((tag) => (
                   <Tag key={tag} color="blue" style={{ fontSize: '11px' }}>
                     {tag}
                   </Tag>
                 ))}
                 {account.tags.length > 3 && (
                   <Tag color="default" style={{ fontSize: '11px' }}>
                     +{account.tags.length - 3}
                   </Tag>
                 )}
              </div>
            ) : null}
            
            <div className="account-created">
              <CalendarOutlined style={{ marginRight: '4px', color: '#8c8c8c' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {new Date(account.createdAt).toLocaleDateString()}
              </Text>
            </div>
          </div>
        </div>

        {account.notes && (
          <>
            <Divider style={{ margin: '8px 0' }} />
            <div className="account-notes">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {account.notes.length > 50 
                  ? `${account.notes.substring(0, 50)}...` 
                  : account.notes
                }
              </Text>
            </div>
          </>
        )}
      </Card>
    );
  };

  const renderAccountList = (account: AccountCredentials) => {
    const isCurrent = account.id === currentAccount?.id;
    const isFavorite = favoriteAccounts.has(account.id);

    return (
      <Card 
        key={account.id}
        className={`account-list-item ${isCurrent ? 'current-account' : ''}`}
        size="small"
        style={{ marginBottom: '8px' }}
      >
        <div className="account-list-content">
          <div className="account-list-left">
            <Badge 
              dot 
              status={account.isActive ? 'success' : 'error'}
              offset={[-4, 4]}
            >
              <Avatar 
                size={32}
                style={{ 
                  backgroundColor: isCurrent ? '#52c41a' : '#1890ff',
                  fontSize: '14px'
                }}
              >
                {getAccountDisplayName(account).charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
            
            <div className="account-list-info">
              <div>
                <Text strong>{getAccountDisplayName(account)}</Text>
                                 {isCurrent && (
                   <Tag color="green" style={{ marginLeft: '8px', fontSize: '12px' }}>
                     {t('current', 'Current')}
                   </Tag>
                 )}
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {account.email}
              </Text>
            </div>
          </div>
          
          <div className="account-list-right">
            <Space>
              <Button
                type="text"
                size="small"
                icon={isFavorite ? <StarFilled /> : <StarOutlined />}
                onClick={() => toggleFavorite(account.id)}
                className={isFavorite ? 'favorite-btn active' : 'favorite-btn'}
              />
              
              {!isCurrent && (
                <Button
                  type="text"
                  size="small"
                  onClick={() => handleSetCurrent(account)}
                >
                  {t('setCurrent', 'Set Current')}
                </Button>
              )}
              
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditAccount(account)}
              />
              
              <Popconfirm
                title={t('deleteAccountConfirm', 'Are you sure?')}
                onConfirm={() => handleDeleteAccount(account.id)}
                okText={t('yes', 'Yes')}
                cancelText={t('no', 'No')}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Space>
          </div>
        </div>
      </Card>
    );
  };

  const renderContent = () => {
    if (accountsLoading) {
      return (
        <div className="loading-container">
          {viewMode === 'grid' ? (
            <Row gutter={[16, 16]}>
              {[...Array(6)].map((_, index) => (
                <Col key={index} xs={24} sm={12} lg={8} xl={6}>
                  <Card>
                    <Skeleton avatar active paragraph={{ rows: 3 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div>
              {[...Array(5)].map((_, index) => (
                <Card key={index} style={{ marginBottom: '8px' }}>
                  <Skeleton avatar active paragraph={{ rows: 1 }} />
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (filteredAndSortedAccounts.length === 0) {
      return (
        <Empty
          description={
            searchText || filterTag 
              ? t('noAccountsFound', 'No accounts found matching your criteria')
              : t('noAccounts', 'No accounts yet')
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {!searchText && !filterTag && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAccount}>
              {t('addFirstAccount', 'Add Your First Account')}
            </Button>
          )}
        </Empty>
      );
    }

    if (viewMode === 'grid') {
      return (
        <Row gutter={[16, 16]}>
          {filteredAndSortedAccounts.map((account) => (
            <Col key={account.id} xs={24} sm={12} lg={8} xl={6}>
              {renderAccountCard(account)}
            </Col>
          ))}
        </Row>
      );
    } else {
      return (
        <div className="account-list">
          {filteredAndSortedAccounts.map(renderAccountList)}
        </div>
      );
    }
  };

  const FormComponent = isMobile ? Drawer : Modal;
  const formProps = isMobile ? {
    title: editingAccount ? t('editAccount', 'Edit Account') : t('addAccount', 'Add Account'),
    open: showForm,
    onClose: () => {
      setShowForm(false);
      form.resetFields();
      setEditingAccount(null);
    },
    width: '100%',
    placement: 'right' as const,
    footer: (
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={() => {
            setShowForm(false);
            form.resetFields();
            setEditingAccount(null);
          }}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            {editingAccount ? t('update', 'Update') : t('add', 'Add')}
          </Button>
        </Space>
      </div>
    ),
  } : {
    title: editingAccount ? t('editAccount', 'Edit Account') : t('addAccount', 'Add Account'),
    open: showForm,
    onCancel: () => {
      setShowForm(false);
      form.resetFields();
      setEditingAccount(null);
    },
    onOk: handleSubmit,
    confirmLoading: loading,
    width: 600,
    okText: editingAccount ? t('update', 'Update') : t('add', 'Add'),
  };

  return (
    <>
      <Modal
        title={
          <div className="account-management-header">
            <Title level={3} style={{ margin: 0 }}>
              <SettingOutlined style={{ marginRight: '8px' }} />
              {t('accountManagement', 'Account Management')}
            </Title>
            <Text type="secondary">
              {t('manageAccountsDescription', 'Manage your Cloudflare accounts')}
            </Text>
          </div>
        }
        open={visible}
        onCancel={onClose}
        width={isMobile ? '100%' : 1200}
        footer={null}
        className="account-management-modal"
        style={isMobile ? { top: 0, paddingBottom: 0 } : {}}
        bodyStyle={isMobile ? { height: 'calc(100vh - 110px)', overflow: 'auto' } : {}}
      >
        {/* 工具栏 */}
        <div className="account-toolbar">
          <div className="toolbar-left">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddAccount}
              size={isMobile ? 'middle' : 'large'}
            >
              {isMobile ? t('add', 'Add') : t('addAccount', 'Add Account')}
            </Button>
          </div>
          
          <div className="toolbar-center">
            <Search
              placeholder={t('searchAccounts', 'Search accounts...')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: isMobile ? 200 : 300 }}
              allowClear
            />
          </div>
          
          <div className="toolbar-right">
            <Space>
              {allTags.length > 0 && (
                <Select
                  placeholder={t('filterByTag', 'Filter by tag')}
                  value={filterTag}
                  onChange={setFilterTag}
                  allowClear
                  style={{ width: 120 }}
                  size={isMobile ? 'middle' : 'large'}
                >
                  {allTags.map(tag => (
                    <Select.Option key={tag} value={tag}>{tag}</Select.Option>
                  ))}
                </Select>
              )}
              
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 100 }}
                size={isMobile ? 'middle' : 'large'}
              >
                <Select.Option value="name">{t('name', 'Name')}</Select.Option>
                <Select.Option value="created">{t('created', 'Created')}</Select.Option>
                <Select.Option value="status">{t('status', 'Status')}</Select.Option>
              </Select>
              
              <Button.Group>
                <Button
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewMode('grid')}
                  size={isMobile ? 'middle' : 'large'}
                />
                <Button
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setViewMode('list')}
                  size={isMobile ? 'middle' : 'large'}
                />
              </Button.Group>
            </Space>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="account-stats">
          <Row gutter={16}>
            <Col span={6}>
              <div className="stat-item">
                <Text type="secondary">{t('total', 'Total')}</Text>
                <div className="stat-number">{accounts.length}</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="stat-item">
                <Text type="secondary">{t('active', 'Active')}</Text>
                <div className="stat-number">{accounts.filter(a => a.isActive).length}</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="stat-item">
                <Text type="secondary">{t('favorites', 'Favorites')}</Text>
                <div className="stat-number">{favoriteAccounts.size}</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="stat-item">
                <Text type="secondary">{t('current', 'Current')}</Text>
                <div className="stat-number">{currentAccount ? 1 : 0}</div>
              </div>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* 账号列表 */}
        <div className="account-content">
          {renderContent()}
        </div>
      </Modal>

      {/* 添加/编辑表单 */}
      <FormComponent {...formProps}>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          style={{ paddingTop: isMobile ? '16px' : '0' }}
        >
          <Form.Item
            name="name"
            label={t('accountName', 'Account Name')}
            rules={[
              { required: true, message: t('accountNameRequired', 'Please enter account name') }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('accountNamePlaceholder', 'Enter a friendly name for this account')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('email', 'Email')}
            rules={[
              { required: true, message: t('emailRequired', 'Please enter email') },
              { type: 'email', message: t('emailInvalid', 'Please enter a valid email') }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t('emailPlaceholder', 'Cloudflare account email')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="globalAPIKey"
            label={t('globalAPIKey', 'Global API Key')}
            rules={[
              { required: true, message: t('globalAPIKeyRequired', 'Please enter Global API Key') }
            ]}
          >
            <Input.Password
              placeholder={t('globalAPIKeyPlaceholder', 'Your Cloudflare Global API Key')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="accountId"
            label={t('accountId', 'Account ID (Optional)')}
          >
            <Input
              prefix={<GlobalOutlined />}
              placeholder={t('accountIdPlaceholder', 'Cloudflare Account ID')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label={t('tags', 'Tags')}
          >
            <Select
              mode="tags"
              placeholder={t('tagsPlaceholder', 'Add tags to organize accounts')}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label={t('notes', 'Notes')}
          >
            <TextArea
              rows={4}
              placeholder={t('notesPlaceholder', 'Additional notes about this account')}
            />
          </Form.Item>
        </Form>
      </FormComponent>
    </>
  );
};

export default AccountManagement; 