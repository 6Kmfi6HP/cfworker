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
import { FacebookShareButton, TwitterShareButton, TelegramShareButton, WhatsappShareButton, FacebookIcon, TwitterIcon, TelegramIcon, WhatsappIcon } from 'react-share';
import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { v4 as uuidv4 } from 'uuid';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

// 获取随机分享文案的函数
const getRandomShareText = () => {
  const { t } = useTranslation();
  const shareTexts = t('shareTexts', { returnObjects: true }) as string[];
  const randomIndex = Math.floor(Math.random() * shareTexts.length);
  return shareTexts[randomIndex];
}; // Import the i18n instance from the correct file

import img from "./getGlobalAPIKey.png";

// Add this array of words for generating worker names
const words = [
  // Fast and dynamic
  'swift', 'breeze', 'cloud', 'spark', 'nova', 'pulse', 'wave', 'flux', 'echo', 'zephyr', 'blaze', 'comet', 'drift', 'ember', 'flare', 'glow', 'haze', 'mist', 'quasar', 'ray', 'shine', 'twilight', 'vortex', 'whirl', 'zenith',
  // Tech-related
  'quantum', 'cyber', 'pixel', 'byte', 'data', 'crypto', 'neural', 'matrix', 'vector', 'binary',
  // Nature-inspired
  'aurora', 'storm', 'thunder', 'frost', 'glacier', 'ocean', 'river', 'forest', 'mountain', 'desert',
  // Space-themed
  'nebula', 'galaxy', 'cosmos', 'stellar', 'lunar', 'solar', 'astro', 'orbit', 'meteor', 'titan',
  // Power and energy
  'dynamo', 'fusion', 'plasma', 'photon', 'atomic', 'energy', 'power', 'force', 'charge', 'surge'
];

// Add this new import for the Cloudflare logo

// Add this new import for the useTheme hook
import { ThemeProvider, useTheme } from './ThemeContext';

import './theme.css';

import { Helmet } from 'react-helmet';

// Near the top of the file, add this constant
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "https://cfworkerback-pages5.pages.dev/createWorker";

function App() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [node, setNode] = useState(
    "vless://d342d11e-d424-4583-b36e-524ab1f0afa4@www.visa.com.sg:8880?encryption=none&security=none&type=ws&host=a.srps7gic.workers.dev&path=%2F%3Fed%3D2560#worker节点"
  );
  const [url, setUrl] = useState(
    "https://www.cloudflare.com/"
  );
  const [form] = Form.useForm();
  const [isNodeGenerated, setIsNodeGenerated] = useState(false);
  const [, setProxyIp] = useState('');
  const [, setSocks5Proxy] = useState('');
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [socks5RelayEnabled, setSocks5RelayEnabled] = useState(false);

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
        API_ENDPOINT,
        filteredFormData
      );

      setNode(data.node);
      setUrl(data.url);
      setIsNodeGenerated(true);
      setShowShareModal(true); // 显示分享弹窗
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

  const handleProxyIpChange = (value: string) => {
    setProxyIp(value);
    if (value && !form.getFieldValue('socks5Relay')) {
      form.setFieldValue('socks5Proxy', '');
      setSocks5Proxy('');
    }
  };

  const handleSocks5ProxyChange = (value: string) => {
    setSocks5Proxy(value);
    if (value && !form.getFieldValue('socks5Relay')) {
      form.setFieldValue('proxyIp', '');
      setProxyIp('');
    }
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
          <p>
          <Button size="large" color="default" type="link" onClick={() => setOpen(true)}>
            {t('howToGetApiKey')}
          </Button>
          </p>
          
          {/* link to youtube channel tour video */}
          <Button size="large" color="default" type="link" href="https://youtu.be/PZMbH7awZRE?si=UxohdialRXq8dL2F"
            target="_blank"
            rel="noopener noreferrer" // Add these attributes
          >
            {t('Towatchvideo')}
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
        form={form}
        layout="vertical"
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
                          label={<Tooltip title={t('proxyIpTooltip')}>{t('proxyIp')}</Tooltip>}
                          name="proxyIp"
                        >
                          <Input 
                            placeholder={!!form.getFieldValue('socks5Proxy') 
                              ? "Proxy IP is disabled when using Socks5 proxy" 
                              : "Example: cdn.xn--b6gac.eu.org:443 or 1.1.1.1:7443,2.2.2.2:443,[2a01:4f8:c2c:123f:64:5:6810:c55a]"
                            }
                            onChange={(e) => handleProxyIpChange(e.target.value)}
                            disabled={socks5RelayEnabled ? false : (!!form.getFieldValue('socks5Proxy'))}
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
                      placeholder={!!form.getFieldValue('proxyIp') && !form.getFieldValue('socks5Relay')
                        ? "Socks5 proxy is disabled when using proxy IP without relay" 
                        : "Example: user:pass@host:port or user1:pass1@host1:port1,user2:pass2@host2:port2"
                      }
                      onChange={(e) => handleSocks5ProxyChange(e.target.value)}
                      disabled={form.getFieldValue('socks5Relay') ? false : (!!form.getFieldValue('proxyIp') && !form.getFieldValue('socks5Relay'))}
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <FacebookShareButton
                url={window.location.href}
                hashtag={`#CFWorker ${getRandomShareText()}`}
                disabled={!isNodeGenerated}
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <TwitterShareButton
                url={window.location.href}
                title={getRandomShareText()}
                disabled={!isNodeGenerated}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
              <TelegramShareButton
                url={window.location.href}
                title={getRandomShareText()}
                disabled={!isNodeGenerated}
              >
                <TelegramIcon size={32} round />
              </TelegramShareButton>
              <WhatsappShareButton
                url={window.location.href}
                title={getRandomShareText()}
                disabled={!isNodeGenerated}
              >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
            </div>
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

      <Modal
        title={t('title')}
        open={showShareModal}
        onCancel={() => setShowShareModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowShareModal(false)}>
            {t('close')}
          </Button>
        ]}
      >
        <p style={{ marginBottom: '20px' }}>{t('shareDescription')}</p>
        <Space style={{ width: '100%', justifyContent: 'center', gap: '16px' }}>
          <FacebookShareButton
            url={window.location.href}
            hashtag={`#CFWorker ${getRandomShareText()}`}
          >
            <FacebookIcon size={64} round />
          </FacebookShareButton>
          <TwitterShareButton
            url={window.location.href}
            title={getRandomShareText()}
          >
            <TwitterIcon size={64} round />
          </TwitterShareButton>
          <TelegramShareButton
            url={window.location.href}
            title={getRandomShareText()}
          >
            <TelegramIcon size={64} round />
          </TelegramShareButton>
          <WhatsappShareButton
            url={window.location.href}
            title={getRandomShareText()}
          >
            <WhatsappIcon size={64} round />
          </WhatsappShareButton>
        </Space>
      </Modal>
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
