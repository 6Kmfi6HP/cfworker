import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Popconfirm,
  message,
  Avatar,
  Tooltip,
  Typography,
  Skeleton,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useAccount } from '../contexts/AccountContext';
import { AccountFormData, AccountCredentials } from '../types/account';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import VirtualAccountList from './VirtualAccountList';

const { Text } = Typography;
const { TextArea } = Input;

interface AccountManagementProps {
  visible: boolean;
  onClose: () => void;
}

const AccountManagement: React.FC<AccountManagementProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { accounts, addAccount, updateAccount, deleteAccount, currentAccount, setCurrentAccount, loading: accountsLoading } = useAccount();
  const [form] = Form.useForm();
  const [editingAccount, setEditingAccount] = useState<AccountCredentials | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useVirtualScroll, setUseVirtualScroll] = useState(false);

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
      } else {
        await addAccount(formData);
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
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleDeleteAccountWithConfirm = (accountId: string) => {
    Modal.confirm({
      title: t('deleteAccountConfirm', 'Are you sure you want to delete this account?'),
      onOk: () => handleDeleteAccount(accountId),
      okText: t('yes', 'Yes'),
      cancelText: t('no', 'No'),
    });
  };

  const handleSetCurrent = (account: AccountCredentials) => {
    setCurrentAccount(account);
    message.success(t('accountSetAsCurrent', 'Account set as current'));
  };

  const getAccountDisplayName = (account: AccountCredentials) => {
    return account.name || account.email;
  };

  const columns: ColumnsType<AccountCredentials> = [
    {
      title: t('account', 'Account'),
      key: 'account',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar style={{ backgroundColor: '#1890ff' }}>
            {getAccountDisplayName(record).charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{getAccountDisplayName(record)}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
            {record.id === currentAccount?.id && (
              <Tag color="green" style={{ marginLeft: '8px', fontSize: '10px' }}>
                {t('current', 'Current')}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t('tags', 'Tags'),
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <Tag key={tag} color="blue" style={{ fontSize: '12px' }}>
                {tag}
              </Tag>
            ))
          ) : (
            <Text type="secondary">-</Text>
          )}
        </div>
      ),
    },
    {
      title: t('status', 'Status'),
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'} icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}>
          {isActive ? t('active', 'Active') : t('inactive', 'Inactive')}
        </Tag>
      ),
    },
    {
      title: t('created', 'Created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <Text type="secondary">{new Date(date).toLocaleDateString()}</Text>
        </Tooltip>
      ),
    },
    {
      title: t('actions', 'Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.id !== currentAccount?.id && (
            <Button
              type="link"
              size="small"
              onClick={() => handleSetCurrent(record)}
            >
              {t('setCurrent', 'Set Current')}
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditAccount(record)}
          >
            {t('edit', 'Edit')}
          </Button>
          <Popconfirm
            title={t('deleteAccountConfirm', 'Are you sure you want to delete this account?')}
            onConfirm={() => handleDeleteAccount(record.id)}
            okText={t('yes', 'Yes')}
            cancelText={t('no', 'No')}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              {t('delete', 'Delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={t('accountManagement', 'Account Management')}
        open={visible}
        onCancel={onClose}
        width={1000}
        footer={null}
      >
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddAccount}
          >
            {t('addAccount', 'Add Account')}
          </Button>
          
          {accounts.length > 10 && (
            <Space>
              <span>{t('viewMode', 'View Mode')}:</span>
              <Button
                type={useVirtualScroll ? 'default' : 'primary'}
                size="small"
                onClick={() => setUseVirtualScroll(false)}
              >
                {t('table', 'Table')}
              </Button>
              <Button
                type={useVirtualScroll ? 'primary' : 'default'}
                size="small"
                onClick={() => setUseVirtualScroll(true)}
              >
                {t('virtualList', 'Virtual List')}
              </Button>
            </Space>
          )}
        </div>

        {accountsLoading ? (
          <div>
            {[...Array(5)].map((_, index) => (
              <div key={index} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Skeleton.Avatar active size="default" />
                  <div style={{ flex: 1 }}>
                    <Skeleton.Input active size="small" style={{ width: '150px', marginBottom: '8px' }} />
                    <Skeleton.Input active size="small" style={{ width: '200px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Skeleton.Button active size="small" />
                    <Skeleton.Button active size="small" />
                    <Skeleton.Button active size="small" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : useVirtualScroll ? (
          <VirtualAccountList
            accounts={accounts}
            currentAccount={currentAccount}
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccountWithConfirm}
            onSetCurrent={handleSetCurrent}
            height={500}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={accounts}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => t('totalAccounts', `Total ${total} accounts`),
            }}
          />
        )}
      </Modal>

      <Modal
        title={editingAccount ? t('editAccount', 'Edit Account') : t('addAccount', 'Add Account')}
        open={showForm}
        onCancel={() => {
          setShowForm(false);
          form.resetFields();
          setEditingAccount(null);
        }}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
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
              placeholder={t('emailPlaceholder', 'Cloudflare account email')}
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
            />
          </Form.Item>

          <Form.Item
            name="accountId"
            label={t('accountId', 'Account ID (Optional)')}
          >
            <Input
              placeholder={t('accountIdPlaceholder', 'Cloudflare Account ID')}
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
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label={t('notes', 'Notes')}
          >
            <TextArea
              rows={3}
              placeholder={t('notesPlaceholder', 'Additional notes about this account')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AccountManagement; 