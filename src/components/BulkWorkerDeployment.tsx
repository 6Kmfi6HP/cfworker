import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Table,
  Space,
  Progress,
  Typography,
  Divider,
  Tag,
  Tooltip,
  Card,
  Skeleton,
  Collapse,
  Switch,
  message,
  Tabs,
  Pagination,
} from 'antd';
import {
  CloudUploadOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  GlobalOutlined,
  UpOutlined,
  DownOutlined,
  HistoryOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useAccount } from '../contexts/AccountContext';
import { apiClient } from '../services/apiClient';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINT, MAX_PROXY_IPS, STATS_API_ENDPOINT, WORKER_NAME_WORDS } from '../utils/constants';
import { getCityToCountry } from '../utils/cityToCountry';
import { v4 as uuidv4 } from 'uuid';
import type { ColumnsType } from 'antd/es/table';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface DeploymentTarget {
  accountId: string;
  accountName: string;
  accountEmail: string;
  status: 'pending' | 'deploying' | 'success' | 'error';
  error?: string;
  workerUrl?: string;
  deploymentTime?: number;
  workerName?: string;
}

interface DeploymentHistoryRecord {
  id: string;
  timestamp: number;
  workerNameBase: string;
  totalAccounts: number;
  successCount: number;
  errorCount: number;
  targets: DeploymentTarget[];
  formData: any;
}

interface BulkWorkerDeploymentProps {
  visible: boolean;
  onClose: () => void;
}

const BulkWorkerDeployment: React.FC<BulkWorkerDeploymentProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { accounts, loading: accountsLoading } = useAccount();
  const [form] = Form.useForm();
  const [deploymentTargets, setDeploymentTargets] = useState<DeploymentTarget[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [currentDeployingAccount, setCurrentDeployingAccount] = useState<string>('');
  
  // Tabs state
  const [activeTab, setActiveTab] = useState('deployment');
  
  // History state
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentHistoryRecord[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize] = useState(10);
  
  // WorkerForm related states
  const [showIpModal, setShowIpModal] = useState(false);
  const [fetchingIps, setFetchingIps] = useState(false);
  const [proxyIp, setProxyIp] = useState('');
  const [socks5Proxy, setSocks5Proxy] = useState('');
  const [proxyIpCount, setProxyIpCount] = useState(0);
  const [countryOptions, setCountryOptions] = useState<{label: string, value: string, count: number}[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [socks5RelayEnabled, setSocks5RelayEnabled] = useState(false);

  // Load saved form data and deployment history on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('cfBulkWorkerFormData');
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      form.setFieldsValue(parsedData);
      
      // Set the state variables from saved data
      if (parsedData.proxyIp) {
        setProxyIp(parsedData.proxyIp);
        const ips = parsedData.proxyIp.split(',').filter((ip: string) => ip.trim() !== '').length;
        setProxyIpCount(ips);
      }
      
      if (parsedData.socks5Proxy) {
        setSocks5Proxy(parsedData.socks5Proxy);
      }
      
      if (parsedData.socks5Relay) {
        setSocks5RelayEnabled(parsedData.socks5Relay);
      }
    }
    
    // Load deployment history
    loadDeploymentHistory();
    
    fetchCountryData();
  }, [form]);

  // Load deployment history from localStorage
  const loadDeploymentHistory = () => {
    const savedHistory = localStorage.getItem('cfBulkDeploymentHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setDeploymentHistory(history);
      } catch (error) {
        console.error('Error loading deployment history:', error);
      }
    }
  };

  // Save deployment history to localStorage
  const saveDeploymentHistory = (newRecord: DeploymentHistoryRecord) => {
    const updatedHistory = [newRecord, ...deploymentHistory];
    // Keep only the latest 50 records
    const limitedHistory = updatedHistory.slice(0, 50);
    setDeploymentHistory(limitedHistory);
    localStorage.setItem('cfBulkDeploymentHistory', JSON.stringify(limitedHistory));
  };

  // Clear deployment history
  const clearDeploymentHistory = () => {
    setDeploymentHistory([]);
    localStorage.removeItem('cfBulkDeploymentHistory');
    message.success(t('deploymentHistoryCleared', 'Deployment history cleared'));
  };

  // Save form data in real-time
  const saveFormData = useCallback(() => {
    const currentValues = form.getFieldsValue();
    localStorage.setItem('cfBulkWorkerFormData', JSON.stringify(currentValues));
  }, [form]);

  // Fetch country data
  const fetchCountryData = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch(STATS_API_ENDPOINT);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const { byCity } = data;
      
      const countryMap: {[key: string]: {count: number, name: string, emoji: string}} = {};
      
      Object.entries(byCity).forEach(([city, count]) => {
        const cityInfo = getCityToCountry(t)[city as keyof ReturnType<typeof getCityToCountry>];
        if (cityInfo) {
          const { code, name, emoji } = cityInfo;
          if (!countryMap[code]) {
            countryMap[code] = { count: 0, name, emoji };
          }
          countryMap[code].count += count as number;
        }
      });
      
      const options = Object.entries(countryMap)
        .map(([code, { count, name, emoji }]) => ({
          value: code,
          label: `${emoji} ${name}`,
          count
        }))
        .sort((a, b) => b.count - a.count);
      
      setCountryOptions(options);
      setShowAllCountries(false);
      
    } catch (error) {
      console.error('Error fetching country data:', error);
      message.error(t('fetchedIpsFail', { error: error instanceof Error ? error.message : String(error) }));
      
      setCountryOptions([
        { label: `🇺🇸 ${t('countries.usa', '美国')}`, value: 'US', count: 0 },
        { label: `🇯🇵 ${t('countries.japan', '日本')}`, value: 'JP', count: 0 },
        { label: `🇬🇧 ${t('countries.uk', '英国')}`, value: 'GB', count: 0 },
        { label: `🇩🇪 ${t('countries.germany', '德国')}`, value: 'DE', count: 0 },
        { label: `🇸🇬 ${t('countries.singapore', '新加坡')}`, value: 'SG', count: 0 }
      ]);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Generate UUID
  const generateUUID = () => {
    const newUUID = uuidv4();
    form.setFieldsValue({ uuid: newUUID });
  };

  // Generate worker name base
  const generateWorkerNameBase = () => {
    const randomWord1 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
    const randomWord2 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
    const newWorkerNameBase = `${randomWord1}-${randomWord2}`;
    form.setFieldsValue({ workerNameBase: newWorkerNameBase });
  };

  // Handle proxy IP change
  const handleProxyIpChange = (value: string) => {
    setProxyIp(value);
    form.setFieldValue('proxyIp', value);
    const ips = value ? value.split(',').filter(ip => ip.trim() !== '').length : 0;
    setProxyIpCount(ips);
    if (value && !socks5RelayEnabled) {
      form.setFieldValue('socks5Proxy', '');
      setSocks5Proxy('');
    }
  };

  // Handle socks5 proxy change
  const handleSocks5ProxyChange = (value: string) => {
    setSocks5Proxy(value);
    form.setFieldValue('socks5Proxy', value);
    if (value && !socks5RelayEnabled) {
      form.setFieldValue('proxyIp', '');
      setProxyIp('');
      setProxyIpCount(0);
    }
  };

  // Fetch IPs by country
  const fetchIpsByCountry = async (countryCode: string) => {
    setFetchingIps(true);
    try {
      const response = await fetch(`https://bestip.06151953.xyz/country/${countryCode}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      let limitedData = [...data];
      if (limitedData.length > MAX_PROXY_IPS) {
        for (let i = limitedData.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [limitedData[i], limitedData[j]] = [limitedData[j], limitedData[i]];
        }
        limitedData = limitedData.slice(0, MAX_PROXY_IPS);
      }
      
      const formattedIps = limitedData.map((item: { ip: string; port: number }) => 
        `${item.ip}:${item.port}`
      ).join(',');
      
      const newValue = formattedIps;
      
      setProxyIp(newValue);
      form.setFieldValue('proxyIp', newValue);
      setProxyIpCount(limitedData.length);
      
      message.success(t('fetchedIpsSuccess', { count: limitedData.length, country: countryCode }));
      setShowIpModal(false);
    } catch (error) {
      console.error('Error fetching IPs:', error);
      message.error(t('fetchedIpsFail', { error: error instanceof Error ? error.message : String(error) }));
    } finally {
      setFetchingIps(false);
    }
  };

  const handleAccountSelection = (selectedAccountIds: string[]) => {
    const targets: DeploymentTarget[] = selectedAccountIds.map(accountId => {
      const account = accounts.find(acc => acc.id === accountId);
      return {
        accountId,
        accountName: account?.name || account?.email || 'Unknown',
        accountEmail: account?.email || '',
        status: 'pending',
      };
    });
    setDeploymentTargets(targets);
  };

  const deployToAccount = async (target: DeploymentTarget, formData: any, index: number): Promise<{ workerUrl: string; deploymentTime: number; workerName: string }> => {
    const account = accounts.find(acc => acc.id === target.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const startTime = Date.now();
    
    // Generate unique worker name for this account using sequential number
    const workerNameBase = formData.workerNameBase || 'worker';
    const sequentialNumber = index + 1; // Start from 1 instead of 0
    const workerName = `${workerNameBase}-${sequentialNumber}`;
    
    // Prepare deployment data using WorkerForm structure
    const deploymentData = {
      ...formData,
      workerName,
      email: account.email,
      globalAPIKey: account.globalAPIKey,
    };

    // Filter out empty values
    const filteredFormData = Object.fromEntries(
      Object.entries(deploymentData).filter(([_, value]) => value !== '' && value !== undefined)
    );
    
    const response = await apiClient.post(API_ENDPOINT, filteredFormData);
    const deploymentTime = Date.now() - startTime;
    
    return {
      workerUrl: response.data.url,
      deploymentTime,
      workerName,
    };
  };

  const handleBulkDeploy = async () => {
    try {
      const values = await form.validateFields();

      if (deploymentTargets.length === 0) {
        message.error(t('targetAccountsRequired', 'Please select target accounts'));
        return;
      }

      setIsDeploying(true);
      setDeploymentProgress(0);

      const deploymentStartTime = Date.now();

      // Deploy to each account sequentially
      for (let i = 0; i < deploymentTargets.length; i++) {
        const target = deploymentTargets[i];
        setCurrentDeployingAccount(target.accountName);

        // Update status to deploying
        setDeploymentTargets(prev => prev.map(t => 
          t.accountId === target.accountId 
            ? { ...t, status: 'deploying' }
            : t
        ));

        try {
          const result = await deployToAccount(target, values, i);
          
          // Update status to success
          setDeploymentTargets(prev => prev.map(t => 
            t.accountId === target.accountId 
              ? { 
                  ...t, 
                  status: 'success', 
                  workerUrl: result.workerUrl,
                  deploymentTime: result.deploymentTime,
                  workerName: result.workerName,
                }
              : t
          ));
        } catch (error: any) {
          // Update status to error
          setDeploymentTargets(prev => prev.map(t => 
            t.accountId === target.accountId 
              ? { 
                  ...t, 
                  status: 'error', 
                  error: error.response?.data?.error || error.message || 'Deployment failed',
                }
              : t
          ));
        }

        // Update progress
        setDeploymentProgress(((i + 1) / deploymentTargets.length) * 100);
      }

      setCurrentDeployingAccount('');
      
      // Save deployment to history after a short delay to ensure state is updated
      setTimeout(() => {
        setDeploymentTargets(currentTargets => {
          const successCount = currentTargets.filter(t => t.status === 'success').length;
          const errorCount = currentTargets.filter(t => t.status === 'error').length;
          
          const historyRecord: DeploymentHistoryRecord = {
            id: uuidv4(),
            timestamp: deploymentStartTime,
            workerNameBase: values.workerNameBase,
            totalAccounts: currentTargets.length,
            successCount,
            errorCount,
            targets: [...currentTargets],
            formData: { ...values },
          };
          
          saveDeploymentHistory(historyRecord);
          return currentTargets;
        });
      }, 100);
      
      message.success(t('bulkDeploymentCompleted', 'Bulk deployment completed'));
    } catch (error) {
      console.error('Bulk deployment failed:', error);
      message.error(t('bulkDeploymentFailed', 'Bulk deployment failed'));
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusIcon = (status: DeploymentTarget['status']) => {
    switch (status) {
      case 'pending':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'deploying':
        return <PlayCircleOutlined style={{ color: '#faad14' }} />;
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: DeploymentTarget['status']) => {
    switch (status) {
      case 'pending':
        return t('pending', 'Pending');
      case 'deploying':
        return t('deploying', 'Deploying');
      case 'success':
        return t('success', 'Success');
      case 'error':
        return t('error', 'Error');
      default:
        return '';
    }
  };

  const columns: ColumnsType<DeploymentTarget> = [
    {
      title: t('account', 'Account'),
      key: 'account',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.accountName}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.accountEmail}
          </Text>
        </div>
      ),
    },
    {
      title: t('workerName', 'Worker Name'),
      key: 'workerName',
      render: (_, record) => (
        record.workerName ? (
          <Text code style={{ fontSize: '12px' }}>{record.workerName}</Text>
        ) : '-'
      ),
    },
    {
      title: t('status', 'Status'),
      key: 'status',
      render: (_, record) => (
        <Space>
          {getStatusIcon(record.status)}
          <span>{getStatusText(record.status)}</span>
        </Space>
      ),
    },
    {
      title: t('result', 'Result'),
      key: 'result',
      render: (_, record) => {
        if (record.status === 'success' && record.workerUrl) {
          return (
            <div>
              <a href={record.workerUrl} target="_blank" rel="noopener noreferrer">
                {t('viewWorker', 'View Worker')}
              </a>
              {record.deploymentTime && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {t('deploymentTime', 'Deployment time')}: {record.deploymentTime}ms
                  </Text>
                </div>
              )}
            </div>
          );
        }
        if (record.status === 'error' && record.error) {
          return (
            <Tooltip title={record.error}>
              <Text type="danger" style={{ fontSize: '12px' }}>
                {record.error.length > 30 ? `${record.error.substring(0, 30)}...` : record.error}
              </Text>
            </Tooltip>
          );
        }
        return '-';
      },
    },
  ];

  const historyColumns: ColumnsType<DeploymentHistoryRecord> = [
    {
      title: t('deploymentTime', 'Deployment Time'),
      key: 'timestamp',
      render: (_, record) => (
        <div>
          <div>{new Date(record.timestamp).toLocaleString()}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.workerNameBase}
          </Text>
        </div>
      ),
      width: 180,
    },
    {
      title: t('accounts', 'Accounts'),
      key: 'accounts',
      render: (_, record) => (
        <div>
          <Tag color="blue">{t('total', 'Total')}: {record.totalAccounts}</Tag>
          <Tag color="green">{t('success', 'Success')}: {record.successCount}</Tag>
          {record.errorCount > 0 && (
            <Tag color="red">{t('error', 'Error')}: {record.errorCount}</Tag>
          )}
        </div>
      ),
      width: 200,
    },
  ];

  const paginatedHistory = deploymentHistory.slice(
    (historyPage - 1) * historyPageSize,
    historyPage * historyPageSize
  );

  const successCount = deploymentTargets.filter(t => t.status === 'success').length;
  const errorCount = deploymentTargets.filter(t => t.status === 'error').length;
  const totalCount = deploymentTargets.length;

  return (
    <>
      <Modal
        title={t('bulkWorkerDeployment', 'Bulk Worker Deployment')}
        open={visible}
        onCancel={onClose}
        width={900}
        footer={null}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'deployment',
              label: (
                <span>
                  <CloudUploadOutlined />
                  {t('bulkDeployment', 'Bulk Deployment')}
                </span>
              ),
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  onValuesChange={saveFormData}
                >
                  <Form.Item
                    name="workerNameBase"
                    label={
                      <Tooltip title={t('workerNameBaseTooltip', 'Base name for workers, each will get a unique suffix')}>
                        {t('workerNameBase', 'Worker Name Base')}
                      </Tooltip>
                    }
                    rules={[{ required: true, message: t('workerNameBaseRequired', 'Please enter worker name base') }]}
                  >
                    <Input
                      placeholder={t('workerNameBasePlaceholder', 'Enter base name for workers')}
                      suffix={
                        <Tooltip title={t('generateWorkerNameBase', 'Generate random base name')}>
                          <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={generateWorkerNameBase}
                            style={{ border: 'none', padding: 0 }}
                          />
                        </Tooltip>
                      }
                    />
                  </Form.Item>

                  <Collapse
                    style={{ marginBottom: 24 }}
                    items={[
                      {
                        key: "1",
                        label: t('additionalParams', 'Additional Parameters'),
                        children: (
                          <>
                            <Form.Item
                              label={<Tooltip title={t('uuidTooltip')}>{t('uuid')}</Tooltip>}
                              name={"uuid"}
                            >
                              <Input
                                suffix={
                                  <Tooltip title={t('uuidTooltip')}>
                                    <Button
                                      type="text"
                                      icon={<ReloadOutlined />}
                                      onClick={generateUUID}
                                      style={{ border: 'none', padding: 0 }}
                                    />
                                  </Tooltip>
                                }
                              />
                            </Form.Item>
                            <Form.Item
                              label={<Tooltip title={t('nodeNameTooltip')}>{t('nodeName')}</Tooltip>}
                              name={"nodeName"}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              label={<Tooltip title={t('socks5RelayTooltip')}>{t('socks5Relay')}</Tooltip>}
                              name="socks5Relay"
                              valuePropName="checked"
                            >
                              <Switch onChange={(checked) => setSocks5RelayEnabled(checked)} />
                            </Form.Item>

                            <Form.Item
                              noStyle
                              shouldUpdate={(prevValues, currentValues) => prevValues.socks5Relay !== currentValues.socks5Relay}
                            >
                              {({ getFieldValue }) =>
                                !getFieldValue('socks5Relay') && (
                                  <Form.Item
                                    label={<Tooltip title={t('proxyIpTooltip')}>{t('proxyIp')}{proxyIpCount > 0 ? ` (${proxyIpCount})` : ''}</Tooltip>}
                                    name="proxyIp"
                                  >
                                    <Input 
                                      value={proxyIp}
                                      placeholder={!!socks5Proxy && !socks5RelayEnabled
                                        ? "Proxy IP is disabled when using Socks5 proxy" 
                                        : "Example: cdn.xn--b6gac.eu.org:443 or 1.1.1.1:7443,2.2.2.2:443,[2a01:4f8:c2c:123f:64:5:6810:c55a]"
                                      }
                                      onChange={(e) => handleProxyIpChange(e.target.value)}
                                      disabled={socks5RelayEnabled ? false : (!!socks5Proxy)}
                                      addonAfter={
                                        <Button 
                                          type="text" 
                                          icon={<GlobalOutlined />} 
                                          onClick={() => setShowIpModal(true)} 
                                          disabled={socks5RelayEnabled ? false : (!!socks5Proxy)}
                                          style={{ 
                                            margin: -7,
                                            height: 30,
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0 10px',
                                            borderLeft: '1px solid #d9d9d9'
                                          }}
                                        >
                                          {t('getProxyIp')}
                                        </Button>
                                      }
                                    />
                                  </Form.Item>
                                )
                              }
                            </Form.Item>

                            <Form.Item
                              label={<Tooltip title={t('socks5ProxyTooltip')}>{t('socks5Proxy')}</Tooltip>}
                              name="socks5Proxy"
                            >
                              <Input
                                value={socks5Proxy}
                                placeholder={!!proxyIp && !socks5RelayEnabled
                                  ? "Socks5 proxy is disabled when using proxy IP without relay" 
                                  : "Example: user:pass@host:port or user1:pass1@host1:port1,user2:pass2@host2:port2"
                                }
                                onChange={(e) => handleSocks5ProxyChange(e.target.value)}
                                disabled={socks5RelayEnabled ? false : (!!proxyIp && !socks5RelayEnabled)}
                              />
                            </Form.Item>

                            <Form.Item
                              label={<Tooltip title={t('customDomainTooltip')}>{t('customDomain')}</Tooltip>}
                              name="customDomain"
                            >
                              <Input placeholder="Example: edtunnel.test.com NOTE: You must owner this domain." />
                            </Form.Item>
                          </>
                        ),
                      },
                    ]}
                  />

                  <Form.Item
                    name="targetAccounts"
                    label={t('targetAccounts', 'Target Accounts')}
                    rules={[{ required: true, message: t('targetAccountsRequired', 'Please select target accounts') }]}
                  >
                    {accountsLoading ? (
                      <Skeleton.Input active style={{ width: '100%', height: '32px' }} />
                    ) : (
                      <Select
                        mode="multiple"
                        placeholder={t('selectTargetAccounts', 'Select accounts to deploy to')}
                        onChange={handleAccountSelection}
                        options={accounts
                          .filter(account => account.isActive)
                          .map(account => ({
                            value: account.id,
                            label: `${account.name || account.email} (${account.email})`,
                          }))}
                      />
                    )}
                  </Form.Item>

                  {deploymentTargets.length > 0 && (
                    <>
                      <Divider />
                      <Title level={5}>{t('deploymentTargets', 'Deployment Targets')}</Title>
                      
                      {isDeploying && (
                        <Card style={{ marginBottom: 16 }}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                              <Text strong>{t('deploymentProgress', 'Deployment Progress')}</Text>
                              {currentDeployingAccount && (
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                  {t('currentlyDeploying', 'Currently deploying to')}: {currentDeployingAccount}
                                </Text>
                              )}
                            </div>
                            <Progress 
                              percent={Math.round(deploymentProgress)} 
                              status={deploymentProgress === 100 ? 'success' : 'active'}
                            />
                            <div>
                              <Tag color="green">{t('success', 'Success')}: {successCount}</Tag>
                              <Tag color="red">{t('error', 'Error')}: {errorCount}</Tag>
                              <Tag>{t('total', 'Total')}: {totalCount}</Tag>
                            </div>
                          </Space>
                        </Card>
                      )}

                      <Table
                        columns={columns}
                        dataSource={deploymentTargets}
                        rowKey="accountId"
                        pagination={false}
                        size="small"
                      />
                    </>
                  )}

                  <Divider />
                  
                  <Space>
                    <Button
                      type="primary"
                      icon={<CloudUploadOutlined />}
                      loading={isDeploying}
                      disabled={deploymentTargets.length === 0}
                      onClick={handleBulkDeploy}
                    >
                      {isDeploying ? t('deploying', 'Deploying') : t('startDeployment', 'Start Deployment')}
                    </Button>
                    <Button onClick={onClose}>
                      {t('cancel', 'Cancel')}
                    </Button>
                  </Space>
                </Form>
              ),
            },
            {
              key: 'history',
              label: (
                <span>
                  <HistoryOutlined />
                  {t('deploymentHistory', 'Deployment History')}
                  {deploymentHistory.length > 0 && (
                    <Tag style={{ marginLeft: 8 }}>{deploymentHistory.length}</Tag>
                  )}
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={5} style={{ margin: 0 }}>
                      {t('deploymentHistory', 'Deployment History')}
                    </Title>
                    {deploymentHistory.length > 0 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={clearDeploymentHistory}
                        size="small"
                      >
                        {t('clearHistory', 'Clear History')}
                      </Button>
                    )}
                  </div>
                  
                  {deploymentHistory.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px',
                      background: '#f8f8f8',
                      borderRadius: '8px',
                      color: '#999'
                    }}>
                      <HistoryOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                      <div>{t('noDeploymentHistory', 'No deployment history yet')}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {t('deploymentHistoryDescription', 'Deployment records will appear here after you complete bulk deployments')}
                      </Text>
                    </div>
                  ) : (
                    <>
                                             <Table
                         columns={historyColumns}
                         dataSource={paginatedHistory}
                         rowKey="id"
                         pagination={false}
                         size="small"
                         expandable={{
                           expandedRowRender: (record) => {
                             // Create history-specific columns that only show completed results
                             const historyDetailColumns: ColumnsType<DeploymentTarget> = [
                               {
                                 title: t('account', 'Account'),
                                 key: 'account',
                                 render: (_, target) => (
                                   <div>
                                     <div style={{ fontWeight: 500 }}>{target.accountName}</div>
                                     <Text type="secondary" style={{ fontSize: '12px' }}>
                                       {target.accountEmail}
                                     </Text>
                                   </div>
                                 ),
                               },
                               {
                                 title: t('workerName', 'Worker Name'),
                                 key: 'workerName',
                                 render: (_, target) => (
                                   target.workerName ? (
                                     <Text code style={{ fontSize: '12px' }}>{target.workerName}</Text>
                                   ) : '-'
                                 ),
                               },
                               {
                                 title: t('status', 'Status'),
                                 key: 'status',
                                 render: (_, target) => (
                                   <Space>
                                     {target.status === 'success' ? (
                                       <>
                                         <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                         <span>{t('success', 'Success')}</span>
                                       </>
                                     ) : target.status === 'error' ? (
                                       <>
                                         <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                                         <span>{t('error', 'Error')}</span>
                                       </>
                                     ) : (
                                       <>
                                         <InfoCircleOutlined style={{ color: '#999' }} />
                                         <span style={{ color: '#999' }}>{t('unknown', 'Unknown')}</span>
                                       </>
                                     )}
                                   </Space>
                                 ),
                               },
                               {
                                 title: t('result', 'Result'),
                                 key: 'result',
                                 render: (_, target) => {
                                   if (target.status === 'success' && target.workerUrl) {
                                     return (
                                       <div>
                                         <a href={target.workerUrl} target="_blank" rel="noopener noreferrer">
                                           {t('viewWorker', 'View Worker')}
                                         </a>
                                         {target.deploymentTime && (
                                           <div>
                                             <Text type="secondary" style={{ fontSize: '12px' }}>
                                               {t('deploymentTime', 'Deployment time')}: {target.deploymentTime}ms
                                             </Text>
                                           </div>
                                         )}
                                       </div>
                                     );
                                   }
                                   if (target.status === 'error' && target.error) {
                                     return (
                                       <Tooltip title={target.error}>
                                         <Text type="danger" style={{ fontSize: '12px' }}>
                                           {target.error.length > 30 ? `${target.error.substring(0, 30)}...` : target.error}
                                         </Text>
                                       </Tooltip>
                                     );
                                   }
                                   return '-';
                                 },
                               },
                             ];

                             return (
                               <div style={{ margin: 0 }}>
                                 <Title level={5} style={{ marginBottom: 16 }}>
                                   {t('deploymentDetails', 'Deployment Details')}
                                 </Title>
                                 <Table
                                   columns={historyDetailColumns}
                                   dataSource={record.targets.filter(target => target.status === 'success' || target.status === 'error')}
                                   rowKey="accountId"
                                   pagination={false}
                                   size="small"
                                   style={{ marginBottom: 16 }}
                                 />
                                 {record.formData && (
                                   <div>
                                     <Title level={5} style={{ marginBottom: 8 }}>
                                       {t('deploymentConfiguration', 'Deployment Configuration')}
                                     </Title>
                                     <div style={{ 
                                       background: '#f5f5f5', 
                                       padding: '12px', 
                                       borderRadius: '6px',
                                       fontSize: '12px',
                                       fontFamily: 'monospace'
                                     }}>
                                       {Object.entries(record.formData)
                                         .filter(([key, value]) => value !== '' && value !== undefined && value !== null)
                                         .map(([key, value]) => (
                                           <div key={key} style={{ marginBottom: '4px' }}>
                                             <Text strong>{key}:</Text> {String(value)}
                                           </div>
                                         ))}
                                     </div>
                                   </div>
                                 )}
                               </div>
                             );
                           },
                           rowExpandable: () => true,
                         }}
                       />
                      
                      {deploymentHistory.length > historyPageSize && (
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                          <Pagination
                            current={historyPage}
                            pageSize={historyPageSize}
                            total={deploymentHistory.length}
                            onChange={setHistoryPage}
                            showSizeChanger={false}
                            showQuickJumper
                            showTotal={(total, range) => 
                              `${range[0]}-${range[1]} of ${total} ${t('records', 'records')}`
                            }
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Modal>

      {/* IP Selection Modal */}
      <Modal
        title={t('selectProxyIpCountry')}
        open={showIpModal}
        onCancel={() => setShowIpModal(false)}
        footer={[
          <Button key="refresh" 
            onClick={fetchCountryData} 
            loading={loadingCountries} 
            icon={<ReloadOutlined />}
            style={{
              borderRadius: '6px',
              boxShadow: '0 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            {t('refreshCountryList')}
          </Button>,
          <Button key="cancel" 
            onClick={() => setShowIpModal(false)}
            style={{
              marginLeft: '10px',
              borderRadius: '6px'
            }}
          >
            {t('cancel')}
          </Button>
        ]}
      >
        <p style={{ marginBottom: '20px' }}>
          {t('selectProxyIpDescription')}
          <br />
          <small>({t('maxIpsInfo', { count: MAX_PROXY_IPS })})</small>
        </p>
        
        {loadingCountries ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '30px 20px',
            background: '#f8f8f8',
            borderRadius: '8px',
            margin: '10px 0'
          }}>
            <div style={{ marginBottom: '10px', fontSize: '16px' }}>
              <ReloadOutlined spin style={{ marginRight: '10px', color: '#1890ff' }} />
              {t('loadingCountries')}
            </div>
            <div style={{ color: '#595959', fontSize: '13px' }}>
              {t('inferringCountries')}
            </div>
          </div>
        ) : (
          <div>
            {countryOptions.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px 20px',
                background: '#f8f8f8',
                borderRadius: '8px',
                margin: '10px 0',
                color: '#ff4d4f'
              }}>
                <div style={{ marginBottom: '10px', fontSize: '16px' }}>
                  {t('noCountriesFound')}
                </div>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                gap: '10px',
                maxHeight: showAllCountries ? '400px' : '250px',
                overflowY: 'auto',
                padding: '10px 5px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #f0f0f0'
              }}>
                {countryOptions
                  .slice(0, showAllCountries ? countryOptions.length : 9)
                  .map(option => (
                    <Button 
                      key={option.value}
                      style={{ 
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '38px',
                        fontSize: 'clamp(12px, 3vw, 14px)',
                        padding: '0 5px',
                        borderRadius: '6px',
                        background: '#f5f5f5',
                        border: '1px solid #e8e8e8',
                        color: '#333333',
                        boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)',
                        transition: 'all 0.3s',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={`${option.count} IPs available`}
                      loading={fetchingIps}
                      onClick={() => fetchIpsByCountry(option.value)}
                      className="country-button"
                    >
                      <span style={{ 
                        fontSize: 'clamp(13px, 3vw, 16px)',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{option.label}</span>
                    </Button>
                  ))}
              </div>
            )}
            {countryOptions.length > 9 && (
              <div style={{ textAlign: 'center', marginTop: '15px', marginBottom: '5px' }}>
                <Button 
                  onClick={() => setShowAllCountries(!showAllCountries)}
                  type="primary"
                  ghost
                  style={{
                    borderRadius: '20px',
                    padding: '0 20px',
                    height: '32px',
                    boxShadow: '0 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  icon={showAllCountries ? <UpOutlined /> : <DownOutlined />}
                >
                  {showAllCountries 
                    ? t('collapseCountries') 
                    : t('showAllCountries', {count: countryOptions.length})}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default BulkWorkerDeployment; 