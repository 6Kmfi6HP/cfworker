import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Collapse,
  Form,
  Input,
  Tooltip,
  Switch,
  message,
  Modal,
  notification,
} from "antd";
import { 
  CloudUploadOutlined, 
  ThunderboltOutlined, 
  ReloadOutlined, 
  DeleteOutlined, 
  SettingOutlined,
  GlobalOutlined,
  UpOutlined,
  DownOutlined
} from "@ant-design/icons";
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../contexts/AccountContext';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINT, MAX_PROXY_IPS, STATS_API_ENDPOINT, WORKER_NAME_WORDS } from '../utils/constants';
import { getCityToCountry } from '../utils/cityToCountry';
import styles from './WorkerForm.module.css';

interface WorkerFormProps {
  onWorkerCreated: (node: string, url: string) => void;
  onShowBulkDeployment: () => void;
  onShowConfigManagement: () => void;
}

const WorkerForm: React.FC<WorkerFormProps> = ({
  onWorkerCreated,
  onShowBulkDeployment,
  onShowConfigManagement
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [fetchingIps, setFetchingIps] = useState(false);
  const [proxyIp, setProxyIp] = useState('');
  const [socks5Proxy, setSocks5Proxy] = useState('');
  const [proxyIpCount, setProxyIpCount] = useState(0);
  const [countryOptions, setCountryOptions] = useState<{label: string, value: string, count: number}[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [socks5RelayEnabled, setSocks5RelayEnabled] = useState(false);
  
  const { t } = useTranslation();
  const { getCurrentCredentials } = useAccount();

  // Load saved form data on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('cfWorkerFormData');
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
    
    fetchCountryData();
  }, [form]);

  // Save form data in real-time
  const saveFormData = useCallback(() => {
    const currentValues = form.getFieldsValue();
    localStorage.setItem('cfWorkerFormData', JSON.stringify(currentValues));
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

  // Create worker
  const createWorker = useCallback(async () => {
    const credentials = getCurrentCredentials();
    if (!credentials) {
      message.error(t('pleaseSelectAccount', 'Please select an account first'));
      return;
    }

    setLoading(true);
    try {
      const formData = await form.validateFields();
      
      const requestData = {
        ...formData,
        email: credentials.email,
        globalAPIKey: credentials.globalAPIKey,
      };

      const filteredFormData = Object.fromEntries(
        Object.entries(requestData).filter(([_, value]) => value !== '' && value !== undefined)
      );
      
      const { data } = await apiClient.post(API_ENDPOINT, filteredFormData);

      onWorkerCreated(data.node, data.url);
      notification.success({
        message: t('workerCreationSuccess'),
        description: t('workerCreationSuccessDesc', 'Worker node has been successfully created and deployed.'),
        placement: 'topRight',
        duration: 4.5,
      });
    } catch (error: any) {
      console.error("创建 Worker 节点失败:", error);
      if (error.response?.data?.message) {
        message.error(t('workerCreationFail') + ": " + error.response.data.error);
      } else {
        message.error(t('workerCreationFail') + ": " + (error instanceof Error ? error.message : String(error)));
      }
    }

    setLoading(false);
  }, [form, t, getCurrentCredentials, onWorkerCreated]);

  // Generate UUID
  const generateUUID = () => {
    const newUUID = uuidv4();
    form.setFieldsValue({ uuid: newUUID });
  };

  // Generate worker name
  const generateWorkerName = () => {
    const randomWord1 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
    const randomWord2 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    const newWorkerName = `${randomWord1}-${randomWord2}-${randomNumber}`;
    form.setFieldsValue({ workerName: newWorkerName });
  };

  // Clear saved data
  const clearSavedData = () => {
    localStorage.removeItem('cfWorkerFormData');
    form.resetFields();
    setProxyIp('');
    setSocks5Proxy('');
    setProxyIpCount(0);
    setSocks5RelayEnabled(false);
    notification.success({
      message: t('dataClearedSuccess'),
      description: t('dataClearedSuccessDesc', 'All saved form data has been cleared successfully.'),
      placement: 'topRight',
      duration: 3,
    });
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
      
      notification.success({
        message: t('fetchedIpsSuccess', { count: limitedData.length, country: countryCode }),
        description: t('fetchedIpsSuccessDesc', 'Proxy IPs have been automatically filled in the form.'),
        placement: 'topRight',
        duration: 4,
      });
      setShowIpModal(false);
    } catch (error) {
      console.error('Error fetching IPs:', error);
      message.error(t('fetchedIpsFail', { error: error instanceof Error ? error.message : String(error) }));
    } finally {
      setFetchingIps(false);
    }
  };

  return (
    <div className={styles.workerFormContainer}>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={saveFormData}
      >
        <Collapse
          style={{ marginBottom: 24 }}
          items={[
            {
              key: "1",
              label: t('additionalParams'),
              children: (
                <>
                  <Form.Item
                    label={
                      <Tooltip title={t('workerNameTooltip')}>
                        {t('workerName')}
                      </Tooltip>
                    }
                    name={"workerName"}
                  >
                    <Input
                      onChange={(e) => {
                        form.setFieldsValue({ nodeName: e.target.value });
                      }}
                      suffix={
                        <Tooltip title={t('workerNameTooltip')}>
                          <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={generateWorkerName}
                            style={{ border: 'none', padding: 0 }}
                          />
                        </Tooltip>
                      }
                    />
                  </Form.Item>
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

        <div className={styles.buttonContainer}>
          {/* 主要操作按钮 */}
          <div className={styles.mainButtons}>
            <Button
              type="primary"
              loading={loading}
              onClick={createWorker}
              icon={<CloudUploadOutlined />}
              className={styles.mainButton}
            >
              {t('createWorkerNode')}
            </Button>
            <Button
              onClick={onShowBulkDeployment}
              icon={<ThunderboltOutlined />}
              className={styles.bulkButton}
            >
              {t('bulkDeploy', 'Bulk Deploy')}
            </Button>
            <Button
              onClick={onShowConfigManagement}
              icon={<SettingOutlined />}
              className={styles.configButton}
            >
              {t('configManagement', 'Config')}
            </Button>
          </div>
          
          {/* 清除数据按钮 */}
          <div className={styles.clearButtonContainer}>
            <Button
              onClick={clearSavedData}
              icon={<DeleteOutlined />}
              className={styles.clearButton}
            >
              {t('clearSavedData')}
            </Button>
          </div>
        </div>
      </Form>

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
              <div className={`${styles.countryGrid} ${showAllCountries ? styles.countryGridExpanded : ''}`}>
                {countryOptions
                  .slice(0, showAllCountries ? countryOptions.length : 9)
                  .map(option => (
                    <Button 
                      key={option.value}
                      className={styles.countryButton}
                      title={`${option.count} IPs available`}
                      loading={fetchingIps}
                      onClick={() => fetchIpsByCountry(option.value)}
                    >
                      <span className={styles.countryButtonSpan}>
                        {option.label}
                      </span>
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
    </div>
  );
};

export default WorkerForm; 