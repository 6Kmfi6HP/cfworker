import {
  Button,
  Collapse,
  Form,
  Image,
  Input,
  Modal,
  Space,
  Tooltip,
  message,
  Switch,
} from "antd";
import { CloudUploadOutlined, ThunderboltOutlined, RocketOutlined, ReloadOutlined, AccountBookFilled, DeleteOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { v4 as uuidv4 } from 'uuid';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import i18n from './i18n'; // Import the i18n instance from the correct file

import img from "./getGlobalAPIKey.png";

// Add this array of words for generating worker names
const words = ['swift', 'breeze', 'cloud', 'spark', 'nova', 'pulse', 'wave', 'flux', 'echo', 'zephyr', 'blaze', 'comet', 'drift', 'ember', 'flare', 'glow', 'haze', 'mist', 'quasar', 'ray', 'shine', 'twilight', 'vortex', 'whirl', 'zenith'];

// Add this new import for the Cloudflare logo

// Add this new import for the useTheme hook
import { ThemeProvider, useTheme } from './ThemeContext';

import './theme.css';

import { Helmet } from 'react-helmet';

function App() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [node, setNode] = useState(
    "vless://d342d11e-d424-4583-b36e-524ab1f0afa4@www.visa.com.sg:8880?encryption=none&security=none&type=ws&host=a.srps7gic.workers.dev&path=%2F%3Fed%3D2560#worker节点"
  );
  const [url, setUrl] = useState(
    "https://www.cloudflare.com/"
  );
  const [form] = Form.useForm();
  const [isNodeGenerated, setIsNodeGenerated] = useState(false);
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Load saved form data and language on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('cfWorkerFormData');
    if (savedFormData) {
      form.setFieldsValue(JSON.parse(savedFormData));
    }

    // Load saved language or use browser language
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    } else {
      const browserLang = navigator.language.split('-')[0];
      const supportedLang = ['en', 'zh'].includes(browserLang) ? browserLang : 'en';
      setSelectedLanguage(supportedLang);
      i18n.changeLanguage(supportedLang);
    }
  }, [form]);

  // Save form data in real-time
  const saveFormData = useCallback(() => {
    const currentValues = form.getFieldsValue();
    localStorage.setItem('cfWorkerFormData', JSON.stringify(currentValues));
  }, [form]);

  const createWorker = useCallback(async () => {
    setLoading(true);
    try {
      const formData = await form.validateFields();
      console.log(formData);

      // Filter out empty or undefined values
      const filteredFormData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '' && value !== undefined)
      );
      const { data } = await axios.post(
        "https://cfworkerback-pages.pages.dev/createWorker",
        // "http://localhost:5173/createWorker",
        filteredFormData
      );

      setNode(data.node);
      setUrl(data.url);
      setIsNodeGenerated(true);
      message.success(t('workerCreationSuccess'));
    } catch (error) {
      console.error("创建 Worker 节点失败:", error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message.error(t('workerCreationFail') + ": " + error.response.data.error);
      } else {
        message.error(t('workerCreationFail') + ": " + (error instanceof Error ? error.message : String(error)));
      }
    }

    setLoading(false);
  }, [form, t]);

  const generateUUID = () => {
    const newUUID = uuidv4();
    form.setFieldsValue({ uuid: newUUID });
  };

  const generateWorkerName = () => {
    const randomWord1 = words[Math.floor(Math.random() * words.length)];
    const randomWord2 = words[Math.floor(Math.random() * words.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    const newWorkerName = `${randomWord1}-${randomWord2}-${randomNumber}`;
    form.setFieldsValue({ workerName: newWorkerName });
  };

  // Function to clear saved form data
  const clearSavedData = () => {
    localStorage.removeItem('cfWorkerFormData');
    form.resetFields();
    message.success(t('dataClearedSuccess'));
  };

  // Add this useEffect hook to set the document title
  useEffect(() => {
    document.title = "CF Worker VLESS 节点搭建";
  }, []);

  // Add these new hooks for theme management
  const { theme, setTheme } = useTheme();

  const nodeOutputStyle = {
    backgroundColor: theme === 'dark' ? '#141414' : '#f0f2f5',
    color: theme === 'dark' ? '#ffffff' : '#333333',
    border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
    borderRadius: '8px',
    padding: '24px',
    marginTop: '32px',
    transition: 'filter 0.3s ease-in-out',
  };

  const titleStyle = {
    color: theme === 'dark' ? '#40a9ff' : '#1890ff',
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '20px',
  };

  const copyTextStyle = {
    backgroundColor: theme === 'dark' ? '#262626' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
    borderRadius: '4px',
    padding: '12px',
    fontFamily: "'Fira Code', monospace",
    fontSize: '0.875rem',
    lineHeight: 1.5,
    wordBreak: 'break-all' as const,
    color: theme === 'dark' ? '#ffffff' : '#333333',
  };

  const handleLanguageChange = (value: string) => {
    console.log('Language changed to:', value);
    setSelectedLanguage(value);
    i18n.changeLanguage(value);
    localStorage.setItem('selectedLanguage', value);
  };

  return (
    <div className={`page ${theme}`}>
      <Helmet>
        <title>{t('title')} | Easy Cloudflare Worker Management</title>
        <meta name="description" content={t('metaDescription')} />
        <meta property="og:title" content={`${t('title')} | Easy Cloudflare Worker Management`} />
        <meta property="og:description" content={t('metaDescription')} />
        <meta name="twitter:title" content={`${t('title')} | Easy Cloudflare Worker Management`} />
        <meta name="twitter:description" content={t('metaDescription')} />
      </Helmet>
      <div className="header">
        <h1>
          {t('title')}
          <Switch
            checkedChildren={<SunOutlined />}
            unCheckedChildren={<MoonOutlined />}
            checked={theme === 'light'}
            onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{ marginLeft: '10px' }}
          />
          <Switch
            checkedChildren="EN"
            unCheckedChildren="中"
            checked={selectedLanguage === 'en'}
            onChange={(checked) => handleLanguageChange(checked ? 'en' : 'zh')}
            style={{ marginLeft: '10px' }}
          />
        </h1>
        <p>
          {t('apiKeyDescription')}
          <Button size="large" color="default" type="link" onClick={() => setOpen(true)}>
            {t('howToGetApiKey')}
          </Button>
        </p>
      </div>

      <Modal
        open={open}
        footer={null}
        onCancel={() => {
          setOpen(false);
        }}
      >
        <Image src={img} alt="" />
        <p dangerouslySetInnerHTML={{ __html: t('apiKeyInstructions1') }} />
        <p dangerouslySetInnerHTML={{ __html: t('apiKeyInstructions2') }} />
        <p dangerouslySetInnerHTML={{ __html: t('apiKeyInstructions3') }} />
      </Modal>

      <Form
        layout="vertical"
        form={form}
        onValuesChange={saveFormData}
      >
        <Form.Item
          rules={[
            {
              required: true,
              type: "email",
              message: t('emailTooltip'),
            },
          ]}
          label={<Tooltip title={t('emailTooltip')}>{t('email')}</Tooltip>}
          name={"email"}
          aria-label={t('email')}
        >
          <Input aria-describedby="email-tooltip" />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: t('globalAPIKeyTooltip'),
            },
          ]}
          label={
            <Tooltip title={t('globalAPIKeyTooltip')}>
              {t('globalAPIKey')}
            </Tooltip>
          }
          name={"globalAPIKey"}
        >
          <Input />
        </Form.Item>

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
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.socks5Relay !== currentValues.socks5Relay}
                  >
                    {({ getFieldValue }) =>
                      !getFieldValue('socks5Relay') && (
                        <Form.Item
                          label={<Tooltip title={t('proxyIpTooltip')}>{t('proxyIp')}</Tooltip>}
                          name="proxyIp"
                        >
                          <Input placeholder="cdn.xn--b6gac.eu.org:443" />
                        </Form.Item>
                      )
                    }
                  </Form.Item>

                  <Form.Item
                    label={<Tooltip title={t('customDomainTooltip')}>{t('customDomain')}</Tooltip>}
                    name="customDomain"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label={<Tooltip title={t('socks5ProxyTooltip')}>{t('socks5Proxy')}</Tooltip>}
                    name="socks5Proxy"
                  >
                    <Input />
                  </Form.Item>
                </>
              ),
            },
          ]}
        />

        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
          <Button
            type="primary"
            loading={loading}
            onClick={createWorker}
            icon={<CloudUploadOutlined />}
          >
            {t('createWorkerNode')}
          </Button>
          <Button
            onClick={clearSavedData}
            icon={<DeleteOutlined />}
          >
            {t('clearSavedData')}
          </Button>
        </Space>
      </Form>

      <div
        style={nodeOutputStyle}
        className={`node-output ${isNodeGenerated ? 'active' : 'blurred'}`}
      >
        <h2 style={titleStyle}>{t('workerNodeAddress')}</h2>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space className="action-buttons">
            <Button
              disabled={!isNodeGenerated}
              href={isNodeGenerated ? `clash://install-config/?url=${encodeURIComponent(
                `https://edsub.pages.dev/sub/clash-meta?url=${encodeURIComponent(
                  node
                )}&insert=false`
              )}&name=worker节点` : undefined}
              icon={<ThunderboltOutlined />}
              className="btn-clash"
            >
              {t('importToClash')}
            </Button>
            <Button
              disabled={!isNodeGenerated}
              href={isNodeGenerated ? `shadowrocket://add/sub://${window.btoa(
                `https://edsub.pages.dev/sub/clash-meta?url=${encodeURIComponent(
                  node
                )}&insert=false`
              )}?remark=cf%20worker` : undefined}
              icon={<RocketOutlined />}
              className="btn-shadowrocket"
            >
              {t('importToShadowrocket')}
            </Button>
            <Button
              disabled={!isNodeGenerated}
              href={isNodeGenerated ? url : undefined}
              target="_blank"
              icon={<AccountBookFilled />}
              className="btn-manage"
            >
              {t('manageNode')}
            </Button>
          </Space>
          <CopyToClipboard
            text={node}
            onCopy={() => {
              if (isNodeGenerated) {
                message.success(t('copiedSuccess'));
              }
            }}
          >
            <p style={copyTextStyle}>{isNodeGenerated ? node : t('nodeInfoPlaceholder')}</p>
          </CopyToClipboard>
        </Space>
      </div>

      <Footer />
    </div>
  );
}

// 使用 ThemeProvider 包装 App 组件
const AppWithTheme = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

// Export AppWithTheme as the default export
export default AppWithTheme;
