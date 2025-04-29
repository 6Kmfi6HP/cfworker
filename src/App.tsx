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
import { CloudUploadOutlined, ThunderboltOutlined, RocketOutlined, ReloadOutlined, AccountBookFilled, DeleteOutlined, SunOutlined, MoonOutlined, GlobalOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";
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
const MAX_PROXY_IPS = parseInt(import.meta.env.VITE_MAX_PROXY_IPS || "50");
const STATS_API_ENDPOINT = "https://bestip.06151953.xyz/api/stats";

// 城市到国家的映射函数，支持i18n
const getCityToCountry = (t: any) => ({
  // 欧洲
  "Frankfurt": {code: "DE", name: t('countries.germany', '德国'), emoji: "🇩🇪"},
  "Amsterdam": {code: "NL", name: t('countries.netherlands', '荷兰'), emoji: "🇳🇱"},
  "Paris": {code: "FR", name: t('countries.france', '法国'), emoji: "🇫🇷"},
  "Stockholm": {code: "SE", name: t('countries.sweden', '瑞典'), emoji: "🇸🇪"},
  "Helsinki": {code: "FI", name: t('countries.finland', '芬兰'), emoji: "🇫🇮"},
  "Warsaw": {code: "PL", name: t('countries.poland', '波兰'), emoji: "🇵🇱"},
  "London": {code: "GB", name: t('countries.uk', '英国'), emoji: "🇬🇧"},
  "Vilnius": {code: "LT", name: t('countries.lithuania', '立陶宛'), emoji: "🇱🇹"},
  "Istanbul": {code: "TR", name: t('countries.turkey', '土耳其'), emoji: "🇹🇷"},
  "Madrid": {code: "ES", name: t('countries.spain', '西班牙'), emoji: "🇪🇸"},
  "Zurich": {code: "CH", name: t('countries.switzerland', '瑞士'), emoji: "🇨🇭"},
  "Hamburg": {code: "DE", name: t('countries.germany', '德国'), emoji: "🇩🇪"},
  "Riga": {code: "LV", name: t('countries.latvia', '拉脱维亚'), emoji: "🇱🇻"},
  "Copenhagen": {code: "DK", name: t('countries.denmark', '丹麦'), emoji: "🇩🇰"},
  "Bucharest": {code: "RO", name: t('countries.romania', '罗马尼亚'), emoji: "🇷🇴"},
  "Vienna": {code: "AT", name: t('countries.austria', '奥地利'), emoji: "🇦🇹"},
  "Milan": {code: "IT", name: t('countries.italy', '意大利'), emoji: "🇮🇹"},
  "Oslo": {code: "NO", name: t('countries.norway', '挪威'), emoji: "🇳🇴"},
  "Sofia": {code: "BG", name: t('countries.bulgaria', '保加利亚'), emoji: "🇧🇬"},
  "Tallinn": {code: "EE", name: t('countries.estonia', '爱沙尼亚'), emoji: "🇪🇪"},
  "Moscow": {code: "RU", name: t('countries.russia', '俄罗斯'), emoji: "🇷🇺"},
  "Lyon": {code: "FR", name: t('countries.france', '法国'), emoji: "🇫🇷"},
  "Chișinău": {code: "MD", name: t('countries.moldova', '摩尔多瓦'), emoji: "🇲🇩"},
  "Rome": {code: "IT", name: t('countries.italy', '意大利'), emoji: "🇮🇹"},
  "Budapest": {code: "HU", name: t('countries.hungary', '匈牙利'), emoji: "🇭🇺"},
  "Dublin": {code: "IE", name: t('countries.ireland', '爱尔兰'), emoji: "🇮🇪"},
  "Marseille": {code: "FR", name: t('countries.france', '法国'), emoji: "🇫🇷"},
  "Kyiv": {code: "UA", name: t('countries.ukraine', '乌克兰'), emoji: "🇺🇦"},
  "Düsseldorf": {code: "DE", name: t('countries.germany', '德国'), emoji: "🇩🇪"},
  "Saint Petersburg": {code: "RU", name: t('countries.russia', '俄罗斯'), emoji: "🇷🇺"},
  "Geneva": {code: "CH", name: t('countries.switzerland', '瑞士'), emoji: "🇨🇭"},
  "Manchester": {code: "GB", name: t('countries.uk', '英国'), emoji: "🇬🇧"},
  "Berlin": {code: "DE", name: t('countries.germany', '德国'), emoji: "🇩🇪"},
  "Prague": {code: "CZ", name: t('countries.czechia', '捷克'), emoji: "🇨🇿"},
  "Palermo": {code: "IT", name: t('countries.italy', '意大利'), emoji: "🇮🇹"},
  "Nicosia": {code: "CY", name: t('countries.cyprus', '塞浦路斯'), emoji: "🇨🇾"},
  "Bratislava": {code: "SK", name: t('countries.slovakia', '斯洛伐克'), emoji: "🇸🇰"},
  "Munich": {code: "DE", name: t('countries.germany', '德国'), emoji: "🇩🇪"},
  
  // 亚太
  "Seoul": {code: "KR", name: t('countries.southKorea', '韩国'), emoji: "🇰🇷"},
  "Singapore": {code: "SG", name: t('countries.singapore', '新加坡'), emoji: "🇸🇬"},
  "Tokyo": {code: "JP", name: t('countries.japan', '日本'), emoji: "🇯🇵"},
  "Hong Kong": {code: "HK", name: t('countries.hongKong', '香港'), emoji: "🇭🇰"},
  "Fukuoka": {code: "JP", name: t('countries.japan', '日本'), emoji: "🇯🇵"},
  "Osaka": {code: "JP", name: t('countries.japan', '日本'), emoji: "🇯🇵"},
  "Mumbai": {code: "IN", name: t('countries.india', '印度'), emoji: "🇮🇳"},
  "Taipei": {code: "TW", name: t('countries.taiwan', '台湾'), emoji: "🇹🇼"},
  "Yerevan": {code: "AM", name: t('countries.armenia', '亚美尼亚'), emoji: "🇦🇲"},
  "Bangkok": {code: "TH", name: t('countries.thailand', '泰国'), emoji: "🇹🇭"},
  "Chennai": {code: "IN", name: t('countries.india', '印度'), emoji: "🇮🇳"},
  "Bangalore": {code: "IN", name: t('countries.india', '印度'), emoji: "🇮🇳"},
  "Jakarta": {code: "ID", name: t('countries.indonesia', '印度尼西亚'), emoji: "🇮🇩"},
  "Kaohsiung City": {code: "TW", name: t('countries.taiwan', '台湾'), emoji: "🇹🇼"},
  "Almaty": {code: "KZ", name: t('countries.kazakhstan', '哈萨克斯坦'), emoji: "🇰🇿"},
  "Muscat": {code: "OM", name: t('countries.oman', '阿曼'), emoji: "🇴🇲"},
  "Hyderabad": {code: "IN", name: t('countries.india', '印度'), emoji: "🇮🇳"},
  "Tel Aviv": {code: "IL", name: t('countries.israel', '以色列'), emoji: "🇮🇱"},
  "Haifa": {code: "IL", name: t('countries.israel', '以色列'), emoji: "🇮🇱"},
  "Aktobe": {code: "KZ", name: t('countries.kazakhstan', '哈萨克斯坦'), emoji: "🇰🇿"},
  
  // 北美
  "Los Angeles": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "San Jose": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Ashburn": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Toronto": {code: "CA", name: t('countries.canada', '加拿大'), emoji: "🇨🇦"},
  "Seattle": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Portland": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Newark": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Miami": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Dallas": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Buffalo": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Atlanta": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Denver": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Montréal": {code: "CA", name: t('countries.canada', '加拿大'), emoji: "🇨🇦"},
  "Chicago": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Norfolk": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Phoenix": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Kansas City": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Columbus": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Vancouver": {code: "CA", name: t('countries.canada', '加拿大'), emoji: "🇨🇦"},
  
  // 大洋洲
  "Sydney": {code: "AU", name: t('countries.australia', '澳大利亚'), emoji: "🇦🇺"},
  "Melbourne": {code: "AU", name: t('countries.australia', '澳大利亚'), emoji: "🇦🇺"},
  "Auckland": {code: "NZ", name: t('countries.newZealand', '新西兰'), emoji: "🇳🇿"},
  
  // 南美
  "São Paulo": {code: "BR", name: t('countries.brazil', '巴西'), emoji: "🇧🇷"},
  "Bogota": {code: "CO", name: t('countries.colombia', '哥伦比亚'), emoji: "🇨🇴"},
  "Buenos Aires": {code: "AR", name: t('countries.argentina', '阿根廷'), emoji: "🇦🇷"}
});

function App() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [fetchingIps, setFetchingIps] = useState(false);
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
  const [proxyIpCount, setProxyIpCount] = useState(0);
  const [countryOptions, setCountryOptions] = useState<{label: string, value: string, count: number}[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [socks5RelayEnabled, setSocks5RelayEnabled] = useState(false);

  // Load saved form data and language on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('cfWorkerFormData');
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      form.setFieldsValue(parsedData);
      
      // Initialize IP count if proxyIp exists in saved data
      if (parsedData.proxyIp) {
        const ips = parsedData.proxyIp.split(',').filter((ip: string) => ip.trim() !== '').length;
        setProxyIpCount(ips);
      }
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
    
    // 加载国家/地区数据
    fetchCountryData();
  }, [form]);
  
  // 获取国家/地区数据
  const fetchCountryData = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch(STATS_API_ENDPOINT);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const { byCity } = data;
      
      // 处理城市数据，映射到国家
      const countryMap: {[key: string]: {count: number, name: string, emoji: string}} = {};
      
      // 遍历所有城市，按国家代码分组
      Object.entries(byCity).forEach(([city, count]) => {
        // 重要：每次使用 getCityToCountry 时传入最新的 t 函数
        const cityInfo = getCityToCountry(t)[city as keyof ReturnType<typeof getCityToCountry>];
        if (cityInfo) {
          const { code, name, emoji } = cityInfo;
          if (!countryMap[code]) {
            countryMap[code] = { count: 0, name, emoji };
          }
          countryMap[code].count += count as number;
        }
      });
      
      // 转换为下拉选项格式，并按IP数量排序
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
      
      // 设置一些默认值，以防API失败
      // 重要：使用当前语言的翻译
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
    // Count IPs by splitting on commas
    const ips = value ? value.split(',').filter(ip => ip.trim() !== '').length : 0;
    setProxyIpCount(ips);
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

  // Add a function to fetch IPs by country code
  const fetchIpsByCountry = async (countryCode: string) => {
    setFetchingIps(true);
    try {
      const response = await fetch(`https://bestip.06151953.xyz/country/${countryCode}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Randomly select IPs up to the maximum limit
      let limitedData = [...data];
      if (limitedData.length > MAX_PROXY_IPS) {
        // Shuffle the array using Fisher-Yates algorithm
        for (let i = limitedData.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [limitedData[i], limitedData[j]] = [limitedData[j], limitedData[i]];
        }
        // Take only the first MAX_PROXY_IPS elements after shuffling
        limitedData = limitedData.slice(0, MAX_PROXY_IPS);
      }
      
      // Format the IPs with port and return as comma-separated string
      const formattedIps = limitedData.map((item: { ip: string; port: number }) => 
        `${item.ip}:${item.port}`
      ).join(',');
      
      // Always use the new IPs, replacing any existing content
      const newValue = formattedIps;
      
      // Update the form field and state
      form.setFieldValue('proxyIp', newValue);
      setProxyIp(newValue);
      
      // Update IP count
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

  // Add a useEffect hook to refresh country names when language changes
  useEffect(() => {
    if (selectedLanguage) {
      // If we already have country data, refresh the names without refetching the API
      if (countryOptions.length > 0) {
        fetchCountryData();
      }
    }
  }, [selectedLanguage, t]);

  return (
    <div className={`page ${theme}`}>
      <Helmet>
        <title>{t('title')} | Easy Cloudflare Worker Management</title>
        <meta name="description" content={t('metaDescription')} />
        <meta property="og:title" content={`${t('title')} | Easy Cloudflare Worker Management`} />
        <meta property="og:description" content={t('metaDescription')} />
        <meta name="twitter:title" content={`${t('title')} | Easy Cloudflare Worker Management`} />
        <meta name="twitter:description" content={t('metaDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          {`
            .country-button:hover {
              background-color: ${theme === 'dark' ? '#303030' : '#e6f7ff'} !important;
              border-color: ${theme === 'dark' ? '#177ddc' : '#40a9ff'} !important;
            }
            @media (max-width: 480px) {
              .action-buttons {
                flex-direction: column;
                align-items: stretch;
              }
              .action-buttons > * {
                margin-bottom: 8px;
                width: 100%;
              }
            }
          `}
        </style>
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
                          label={<Tooltip title={t('proxyIpTooltip')}>{t('proxyIp')}{proxyIpCount > 0 ? ` (${proxyIpCount})` : ''}</Tooltip>}
                          name="proxyIp"
                        >
                          <Input 
                            placeholder={!!form.getFieldValue('socks5Proxy') 
                              ? "Proxy IP is disabled when using Socks5 proxy" 
                              : "Example: cdn.xn--b6gac.eu.org:443 or 1.1.1.1:7443,2.2.2.2:443,[2a01:4f8:c2c:123f:64:5:6810:c55a]"
                            }
                            onChange={(e) => handleProxyIpChange(e.target.value)}
                            disabled={socks5RelayEnabled ? false : (!!form.getFieldValue('socks5Proxy'))}
                            addonAfter={
                              <Button 
                                type="text" 
                                icon={<GlobalOutlined />} 
                                onClick={() => setShowIpModal(true)} 
                                disabled={socks5RelayEnabled ? false : (!!form.getFieldValue('socks5Proxy'))}
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

      {/* Add IP Selection Modal */}
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
            background: theme === 'dark' ? '#1f1f1f' : '#f8f8f8',
            borderRadius: '8px',
            margin: '10px 0'
          }}>
            <div style={{ marginBottom: '10px', fontSize: '16px' }}>
              <ReloadOutlined spin style={{ marginRight: '10px', color: '#1890ff' }} />
              {t('loadingCountries')}
            </div>
            <div style={{ color: theme === 'dark' ? '#8c8c8c' : '#595959', fontSize: '13px' }}>
              {t('inferringCountries')}
            </div>
          </div>
        ) : (
          <div>
            {countryOptions.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px 20px',
                background: theme === 'dark' ? '#1f1f1f' : '#f8f8f8',
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
                background: theme === 'dark' ? '#141414' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`
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
                        background: theme === 'dark' ? '#1f1f1f' : '#f5f5f5',
                        border: `1px solid ${theme === 'dark' ? '#303030' : '#e8e8e8'}`,
                        color: theme === 'dark' ? '#ffffff' : '#333333',
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
