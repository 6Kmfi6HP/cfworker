import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  CloudUpload,
  Play,
  CheckCircle,
  AlertTriangle,
  Info,
  RotateCcw,
  Globe,
  ChevronUp,
  ChevronDown,
  History,
  Trash2,
} from 'lucide-react';
import { notification } from '../utils/notifications';
import { useAccount } from '../contexts/AccountContext';
import { apiClient } from '../services/apiClient';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINT, MAX_PROXY_IPS, STATS_API_ENDPOINT, WORKER_NAME_WORDS } from '../utils/constants';
import { getCityToCountry } from '../utils/cityToCountry';
import { v4 as uuidv4 } from 'uuid';
// Removed Ant Design Typography and ColumnsType imports

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
  
  // Form state
  const [formData, setFormData] = useState({
    workerName: '',
    workerNameBase: '',
    uuid: '',
    nodeName: '',
    proxyIp: '',
    socks5Proxy: '',
    socks5Relay: false,
    customDomain: '',
    targetAccounts: [] as string[],
    selectedAccounts: [] as string[]
  });
  const [deploymentTargets, setDeploymentTargets] = useState<DeploymentTarget[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [currentDeployingAccount, setCurrentDeployingAccount] = useState<string>('');
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState('deployment');
  
  // History state
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentHistoryRecord[]>([]);
  const [historyPage, _setHistoryPage] = useState(1);
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

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load saved form data and deployment history on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('cfBulkWorkerFormData');
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      setFormData({
        workerName: parsedData.workerName || '',
        workerNameBase: parsedData.workerNameBase || '',
        uuid: parsedData.uuid || '',
        nodeName: parsedData.nodeName || '',
        proxyIp: parsedData.proxyIp || '',
        socks5Proxy: parsedData.socks5Proxy || '',
        socks5Relay: parsedData.socks5Relay || false,
        customDomain: parsedData.customDomain || '',
        targetAccounts: parsedData.targetAccounts || [],
        selectedAccounts: parsedData.selectedAccounts || []
      });
      
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
  }, []);

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
    notification.success({
      message: t('deploymentHistoryCleared', 'Deployment history cleared'),
      description: t('deploymentHistoryClearedDesc', 'All deployment history records have been removed.'),
      placement: 'topRight',
      duration: 3,
    });
  };

  // Save form data in real-time
  // const _saveFormData = useCallback(() => {
  //   const currentValues = {
  //     ...formData,
  //     proxyIp,
  //     socks5Proxy,
  //     socks5Relay: socks5RelayEnabled
  //   };
  //   localStorage.setItem('cfBulkWorkerFormData', JSON.stringify(currentValues));
  // }, [formData, proxyIp, socks5Proxy, socks5RelayEnabled]);

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
          const cityToCountryMap = getCityToCountry((key: string, fallback?: string) => t(key, { defaultValue: fallback }));
          const cityInfo = cityToCountryMap[city as keyof typeof cityToCountryMap];
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
      notification.error({
        message: t('fetchedIpsFail', { error: error instanceof Error ? error.message : String(error) }),
        placement: 'topRight',
        duration: 4,
      });
      
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
    setFormData(prev => ({ ...prev, uuid: newUUID }));
  };

  // Generate worker name base
  const generateWorkerNameBase = () => {
    const randomWord1 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
    const randomWord2 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
    const newWorkerNameBase = `${randomWord1}-${randomWord2}`;
    setFormData(prev => ({ ...prev, workerName: newWorkerNameBase }));
  };

  // Handle proxy IP change
  const handleProxyIpChange = (value: string) => {
    setProxyIp(value);
    setFormData(prev => ({ ...prev, proxyIp: value }));
    const ips = value ? value.split(',').filter(ip => ip.trim() !== '').length : 0;
    setProxyIpCount(ips);
    if (value && !socks5RelayEnabled) {
      setSocks5Proxy('');
      setFormData(prev => ({ ...prev, socks5Proxy: '' }));
    }
  };

  // Handle socks5 proxy change
  const handleSocks5ProxyChange = (value: string) => {
    setSocks5Proxy(value);
    setFormData(prev => ({ ...prev, socks5Proxy: value }));
    if (value && !socks5RelayEnabled) {
      setProxyIp('');
      setFormData(prev => ({ ...prev, proxyIp: '' }));
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
      setFormData(prev => ({ ...prev, proxyIp: newValue }));
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
      notification.error({
        message: t('fetchedIpsFail', { error: error instanceof Error ? error.message : String(error) }),
        placement: 'topRight',
        duration: 4,
      });
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
      // Basic validation
      if (!formData.workerName.trim()) {
        notification.error({
          message: t('validationError', 'Validation Error'),
          description: t('workerNameRequired', 'Worker name is required'),
        });
        return;
      }

      if (deploymentTargets.length === 0) {
        notification.error({
          message: t('validationError', 'Validation Error'),
          description: t('targetAccountsRequired', 'Please select target accounts'),
        });
        return;
      }

      const values = {
        ...formData,
        proxyIp,
        socks5Proxy,
        socks5Relay: socks5RelayEnabled
      };

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
            workerNameBase: values.workerName,
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
      
      notification.success({
        message: t('bulkDeploymentCompleted', 'Bulk deployment completed'),
        description: t('bulkDeploymentCompletedDesc', `Successfully deployed to ${successCount} accounts with ${errorCount} errors.`),
        placement: 'topRight',
        duration: 5,
      });
    } catch (error) {
      console.error('Bulk deployment failed:', error);
      notification.error({
        message: t('bulkDeploymentFailed', 'Bulk deployment failed'),
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusIcon = (status: DeploymentTarget['status']) => {
    switch (status) {
      case 'pending':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'deploying':
        return <Play className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
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

  const columns = [
    {
      title: t('account', 'Account'),
      key: 'account',
      render: (_: any, record: DeploymentTarget) => (
        <div>
          <div className="font-medium">{record.accountName}</div>
          <div className="text-xs text-muted-foreground">
            {record.accountEmail}
          </div>
        </div>
      ),
    },
    {
      title: t('workerName', 'Worker Name'),
      key: 'workerName',
      render: (_: any, record: DeploymentTarget) => (
        record.workerName ? (
          <code className="text-xs bg-muted px-1 py-0.5 rounded">{record.workerName}</code>
        ) : '-'
      ),
    },
    {
      title: t('status', 'Status'),
      key: 'status',
      render: (_: any, record: DeploymentTarget) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(record.status)}
          <span>{getStatusText(record.status)}</span>
        </div>
      ),
    },
    {
      title: t('result', 'Result'),
      key: 'result',
      render: (_: any, record: DeploymentTarget) => {
        if (record.status === 'success' && record.workerUrl) {
          return (
            <div>
              <a href={record.workerUrl} target="_blank" rel="noopener noreferrer">
                {t('viewWorker', 'View Worker')}
              </a>
              {record.deploymentTime && (
                <div>
                  <div className="text-xs text-muted-foreground">
                    {t('deploymentTime', 'Deployment time')}: {record.deploymentTime}ms
                  </div>
                </div>
              )}
            </div>
          );
        }
        if (record.status === 'error' && record.error) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-red-500 cursor-pointer">
                    {record.error.length > 30 ? `${record.error.substring(0, 30)}...` : record.error}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{record.error}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return '-';
      },
    },
  ];

  const historyColumns = [
    {
      title: t('deploymentTime', 'Deployment Time'),
      key: 'timestamp',
      render: (_: any, record: { timestamp: string | number | Date; workerNameBase: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Iterable<React.ReactNode> | null | undefined; }) => (
        <div>
          <div>{new Date(record.timestamp).toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            {record.workerNameBase}
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: t('accounts', 'Accounts'),
      key: 'accounts',
      render: (_: any, record: { totalAccounts: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Iterable<React.ReactNode> | null | undefined; successCount: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Iterable<React.ReactNode> | null | undefined; errorCount: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined; }) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">{t('total', 'Total')}: {record.totalAccounts}</Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">{t('success', 'Success')}: {record.successCount}</Badge>
          {(record.errorCount as number) > 0 && (
            <Badge variant="secondary" className="bg-red-100 text-red-800">{t('error', 'Error')}: {record.errorCount}</Badge>
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

  // const _containerStyle = {
  //   padding: isMobile ? '16px' : '24px',
  // };

  // const _cardStyle = {
  //   // Styles will be handled by shadcn/ui Card component
  // };

  const ResponsiveContainer = isMobile ? Sheet : Dialog;
  const containerProps = isMobile 
    ? {
        open: visible,
        onOpenChange: (open: boolean) => !open && onClose(),
      }
    : {
        open: visible,
        onOpenChange: (open: boolean) => !open && onClose(),
      };

  return (
    <>
      <ResponsiveContainer {...containerProps}>
        {isMobile ? (
          <SheetContent side="bottom" className="h-[90vh] p-4">
            <SheetHeader>
              <SheetTitle>{t('bulkWorkerDeployment', 'Bulk Worker Deployment')}</SheetTitle>
            </SheetHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="deployment" className="flex items-center gap-2">
                  <CloudUpload className="h-4 w-4" />
                  {t('bulkDeployment', 'Bulk Deployment')}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  {t('deploymentHistory', 'Deployment History')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="deployment" className="mt-4">
                <div className="bg-background rounded-lg p-6">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="text-sm font-medium">
                                {t('workerNameBase', 'Worker Name Base')}
                              </label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('workerNameBaseTooltip', 'Base name for workers, each will get a unique suffix')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="relative">
                          <Input
                            value={formData.workerNameBase || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, workerNameBase: e.target.value }))}
                            placeholder={t('workerNameBasePlaceholder', 'Enter base name for workers')}
                            className="pr-10"
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={generateWorkerNameBase}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('generateWorkerNameBase', 'Generate random base name')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>

                  <Card className="mb-6">
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                        <span className="font-semibold text-sm md:text-base">
                          {t('additionalParams', 'Additional Parameters')}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <label className="text-sm font-medium">{t('uuid')}</label>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('uuidTooltip')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <div className="relative">
                              <Input
                                value={formData.uuid || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, uuid: e.target.value }))}
                                className="pr-10"
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={generateUUID}
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t('uuidTooltip')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <label className="text-sm font-medium">{t('nodeName')}</label>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('nodeNameTooltip')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Input
                              value={formData.nodeName || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, nodeName: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <label className="text-sm font-medium">{t('socks5Relay')}</label>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('socks5RelayTooltip')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Switch
                              checked={socks5RelayEnabled}
                              onCheckedChange={(checked) => {
                                setSocks5RelayEnabled(checked);
                                setFormData(prev => ({ ...prev, socks5Relay: checked }));
                              }}
                            />
                          </div>

                          {!socks5RelayEnabled && (
                            <div className="space-y-2 col-span-full">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <label className="text-sm font-medium">
                                      {t('proxyIp')}{proxyIpCount > 0 ? ` (${proxyIpCount})` : ''}
                                    </label>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t('proxyIpTooltip')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="relative">
                                <Input
                                  value={proxyIp || ''}
                                  placeholder={!!socks5Proxy && !socks5RelayEnabled
                                    ? "Proxy IP is disabled when using Socks5 proxy" 
                                    : "Example: cdn.xn--b6gac.eu.org:443 or 1.1.1.1:7443,2.2.2.2:443,[2a01:4f8:c2c:123f:64:5:6810:c55a]"
                                  }
                                  onChange={(e) => handleProxyIpChange(e.target.value)}
                                  disabled={socks5RelayEnabled ? false : (!!socks5Proxy)}
                                  className="pr-32"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => setShowIpModal(true)}
                                  disabled={socks5RelayEnabled ? false : (!!socks5Proxy)}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3 border-l"
                                >
                                  <Globe className="h-4 w-4 mr-1" />
                                  {t('getProxyIp')}
                                </Button>
                              </div>
                            </div>
                          )}
                          <div className="space-y-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <label className="text-sm font-medium">{t('socks5Proxy')}</label>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('socks5ProxyTooltip')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Input
                              value={socks5Proxy || ''}
                              placeholder={!!proxyIp && !socks5RelayEnabled
                                ? "Socks5 proxy is disabled when using proxy IP without relay" 
                                : "Example: user:pass@host:port or user1:pass1@host1:port1,user2:pass2@host2:port2"
                              }
                              onChange={(e) => handleSocks5ProxyChange(e.target.value)}
                              disabled={socks5RelayEnabled ? false : (!!proxyIp && !socks5RelayEnabled)}
                            />
                          </div>
                          <div className="space-y-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <label className="text-sm font-medium">{t('customDomain')}</label>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('customDomainTooltip')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Input
                              value={formData.customDomain || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, customDomain: e.target.value }))}
                              placeholder="Example: edtunnel.test.com NOTE: You must owner this domain."
                            />
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>

                  <Card className="mb-6 p-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">
                        {t('targetAccounts', 'Target Accounts')}
                      </label>
                      {accountsLoading ? (
                        <div className="w-full h-8 bg-gray-200 animate-pulse rounded" />
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">{t('selectTargetAccounts', 'Select accounts to deploy to')}</div>
                          <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                            {accounts
                              .filter(account => account.isActive)
                              .map(account => (
                                <div key={account.id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`account-${account.id}`}
                                    checked={(formData.targetAccounts || []).includes(account.id)}
                                    onChange={(e) => {
                                      const currentAccounts = formData.targetAccounts || [];
                                      const newAccounts = e.target.checked
                                        ? [...currentAccounts, account.id]
                                        : currentAccounts.filter(id => id !== account.id);
                                      setFormData(prev => ({ ...prev, targetAccounts: newAccounts }));
                                      handleAccountSelection(newAccounts);
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <label htmlFor={`account-${account.id}`} className="text-sm cursor-pointer">
                                    {`${account.name || account.email} (${account.email})`}
                                  </label>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {deploymentTargets.length > 0 && (
                    <>
                      <Separator className="my-6" />
                      <h3 className="text-lg font-semibold mb-4">{t('deploymentTargets', 'Deployment Targets')}</h3>
                      
                      {isDeploying && (
                        <Card className="mb-4 p-4">
                          <div className="space-y-4">
                            <div>
                              <div className="font-semibold text-sm">
                                {t('deploymentProgress', 'Deployment Progress')}
                              </div>
                              {currentDeployingAccount && (
                                <div className="mt-1">
                                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                                    {t('currentlyDeploying', 'Currently deploying to')}: {currentDeployingAccount}
                                  </div>
                                </div>
                              )}
                            </div>
                            <Progress 
                              value={Math.round(deploymentProgress)}
                              className="w-full"
                            />
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {t('success', 'Success')}: {successCount}
                              </Badge>
                              <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                {t('error', 'Error')}: {errorCount}
                              </Badge>
                              <Badge variant="secondary">
                                {t('total', 'Total')}: {totalCount}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      )}

                      <Card className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {columns.map((col, index) => (
                                <TableHead key={index}>{col.title}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deploymentTargets.map((target) => (
                              <TableRow key={target.accountId}>
                                {columns.map((col, index) => (
                                  <TableCell key={index}>
                                    {col.render ? col.render((target as any)[col.key], target) : (target as any)[col.key]}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    </>
                  )}

                  <Separator className="my-6" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    <Button
                      className="w-full font-medium"
                      disabled={deploymentTargets.length === 0 || isDeploying}
                      onClick={handleBulkDeploy}
                    >
                      <CloudUpload className="w-4 h-4 mr-2" />
                      {isDeploying ? t('deploying', 'Deploying') : t('startDeployment', 'Start Deployment')}
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={onClose}
                    >
                      {t('cancel', 'Cancel')}
                    </Button>
                  </div>
                  </form>
                </div>
              </TabsContent>
              <TabsContent value="history">
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  {t('deploymentHistory', 'Deployment History')}
                  {deploymentHistory.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{deploymentHistory.length}</Badge>
                  )}
                </span>
                <div className="p-4">
                  <Card className="mb-4 p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                      <h3 className="text-lg font-semibold m-0">
                        {t('deploymentHistory', 'Deployment History')}
                      </h3>
                      {deploymentHistory.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={clearDeploymentHistory}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('clearHistory', 'Clear History')}
                        </Button>
                      )}
                    </div>
                  </Card>
                  
                  {deploymentHistory.length === 0 ? (
                    <Card className="p-8">
                      <div className="text-center space-y-3">
                        <History className="w-6 h-6 mx-auto text-gray-400" />
                        <div className="text-base font-medium text-gray-600 dark:text-gray-400">
                          {t('noDeploymentHistory', 'No deployment history yet')}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-500">
                          {t('deploymentHistoryDescription', 'Deployment records will appear here after you complete bulk deployments')}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <>
                      <Card>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {historyColumns.map((col) => (
                                  <TableHead key={col.key}>{col.title}</TableHead>
                                ))}
                                <TableHead>{t('actions', 'Actions')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedHistory.map((record) => (
                                <TableRow key={record.id}>
                                  {historyColumns.map((col) => (
                                    <TableCell key={col.key}>
                                      {col.render ? col.render(null, record) : (record as any)[col.key]}
                                    </TableCell>
                                  ))}
                                  <TableCell>
                                    <Collapsible>
                                      <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <ChevronDown className="w-4 h-4" />
                                        </Button>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent className="mt-2">
                                         <div className="space-y-4">
                                           <h4 className="font-medium">{t('deploymentDetails', 'Deployment Details')}</h4>
                                           <div className="space-y-2">
                                             {record.targets.filter(target => target.status === 'success' || target.status === 'error').map((target) => (
                                               <div key={target.accountId} className="border rounded-lg p-3 space-y-2">
                                                 <div className="flex justify-between items-start">
                                                   <div>
                                                     <div className="font-medium">{target.accountName}</div>
                                                     <div className="text-xs text-muted-foreground">{target.accountEmail}</div>
                                                   </div>
                                                   <div className="flex items-center gap-2">
                                                     {target.status === 'success' ? (
                                                       <>
                                                         <CheckCircle className="w-4 h-4 text-green-500" />
                                                         <span className="text-sm">{t('success', 'Success')}</span>
                                                       </>
                                                     ) : target.status === 'error' ? (
                                                       <>
                                                         <AlertTriangle className="w-4 h-4 text-red-500" />
                                                         <span className="text-sm">{t('error', 'Error')}</span>
                                                       </>
                                                     ) : (
                                                       <>
                                                         <Info className="w-4 h-4 text-gray-500" />
                                                         <span className="text-sm text-gray-500">{t('unknown', 'Unknown')}</span>
                                                       </>
                                                     )}
                                                   </div>
                                                 </div>
                                                 {target.workerName && (
                                                   <div className="text-xs">
                                                     <span className="font-medium">{t('workerName', 'Worker Name')}: </span>
                                                     <code className="bg-muted px-1 rounded">{target.workerName}</code>
                                                   </div>
                                                 )}
                                                 {target.status === 'success' && target.workerUrl && (
                                                   <div className="space-y-1">
                                                     <a href={target.workerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                                       {t('viewWorker', 'View Worker')}
                                                     </a>
                                                     {target.deploymentTime && (
                                                       <div className="text-xs text-muted-foreground">
                                                         {t('deploymentTime', 'Deployment time')}: {target.deploymentTime}ms
                                                       </div>
                                                     )}
                                                   </div>
                                                 )}
                                                 {target.status === 'error' && target.error && (
                                                   <TooltipProvider>
                                                     <Tooltip>
                                                       <TooltipTrigger asChild>
                                                         <div className="text-xs text-red-600 cursor-help">
                                                           {target.error.length > 30 ? `${target.error.substring(0, 30)}...` : target.error}
                                                         </div>
                                                       </TooltipTrigger>
                                                       <TooltipContent>
                                                         <p>{target.error}</p>
                                                       </TooltipContent>
                                                     </Tooltip>
                                                   </TooltipProvider>
                                                 )}
                                               </div>
                                             ))}
                                           </div>
                                           {record.formData && (
                                             <div>
                                               <h5 className="font-medium mb-2">{t('deploymentConfiguration', 'Deployment Configuration')}</h5>
                                               <div className="bg-muted p-3 rounded-lg text-xs font-mono max-h-[300px] overflow-y-auto border">
                                                 {Object.entries(record.formData)
                                                   .filter(([, value]) => value !== '' && value !== undefined && value !== null)
                                                   .map(([key, value]) => {
                                                     const stringValue = String(value);
                                                     return (
                                                       <div key={key} className="mb-2 break-all leading-relaxed">
                                                         <span className="font-semibold text-foreground">{key}:</span>
                                                         <span className="ml-2 text-muted-foreground">
                                                           {stringValue.length > 50 ? (
                                                             <>
                                                               {stringValue.substring(0, 50)}
                                                               <TooltipProvider>
                                                                 <Tooltip>
                                                                   <TooltipTrigger asChild>
                                                                     <span className="text-blue-600 cursor-help">...more</span>
                                                                   </TooltipTrigger>
                                                                   <TooltipContent>
                                                                     <p className="max-w-xs break-all">{stringValue}</p>
                                                                   </TooltipContent>
                                                                 </Tooltip>
                                                               </TooltipProvider>
                                                             </>
                                                           ) : (
                                                             stringValue
                                                           )}
                                                         </span>
                                                       </div>
                                                     );
                                                   })}
                                               </div>
                                             </div>
                                           )}
                                         </div>
                                       </CollapsibleContent>
                                     </Collapsible>
                                   </TableCell>
                                 </TableRow>
                               ))}
                             </TableBody>
                           </Table>
                         </div>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </SheetContent>
        ) : (
          // Desktop version would go here
          <div>Desktop version placeholder</div>
        )}

      {/* IP Selection Dialog */}
      <Dialog open={showIpModal} onOpenChange={setShowIpModal}>
        <DialogContent className={`${isMobile ? 'w-[95vw]' : isTablet ? 'w-[80vw]' : 'max-w-[600px]'} max-h-[80vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>{t('selectProxyIpCountry')}</DialogTitle>
          </DialogHeader>
          <div className="mb-5 p-4 bg-muted rounded-lg border">
            <div className={`${isMobile ? 'text-sm' : 'text-base'} mb-2`}>
              {t('selectProxyIpDescription')}
            </div>
            <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
              ({t('maxIpsInfo', { count: MAX_PROXY_IPS })})
            </div>
          </div>
        
          {loadingCountries ? (
            <Card>
              <CardContent className={`text-center ${isMobile ? 'p-4' : 'p-6'}`}>
                <div className={`mb-2 ${isMobile ? 'text-sm' : 'text-base'} flex items-center justify-center gap-2`}>
                  <RotateCcw className="w-4 h-4 animate-spin text-primary" />
                  {t('loadingCountries')}
                </div>
                <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {t('inferringCountries')}
                </div>
              </CardContent>
            </Card>
        ) : (
            <div>
              {countryOptions.length === 0 ? (
                <Card>
                  <CardContent className={`text-center ${isMobile ? 'p-4' : 'p-6'} text-destructive`}>
                    <div className={`${isMobile ? 'text-sm' : 'text-base'}`}>
                      {t('noCountriesFound')}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className={`grid gap-2 ${isMobile ? 'grid-cols-[repeat(auto-fit,minmax(80px,1fr))] p-2' : 'grid-cols-[repeat(auto-fit,minmax(100px,1fr))] p-3'} ${showAllCountries ? 'max-h-[400px]' : isMobile ? 'max-h-[200px]' : 'max-h-[250px]'} overflow-y-auto`}>
                    {countryOptions
                      .slice(0, showAllCountries ? countryOptions.length : 9)
                      .map(option => (
                        <Button 
                          key={option.value}
                          variant="outline"
                          size="sm"
                          className="h-[38px] text-center flex justify-center items-center text-xs md:text-sm px-2 whitespace-nowrap overflow-hidden text-ellipsis country-button"
                          title={`${option.count} IPs available`}
                          disabled={fetchingIps}
                          onClick={() => fetchIpsByCountry(option.value)}
                        >
                          <span className="w-full overflow-hidden text-ellipsis">
                            {option.label}
                          </span>
                        </Button>
                      ))}
                   </CardContent>
                   {countryOptions.length > 9 && (
                     <div className="text-center mt-4 mb-2">
                       <Button 
                         onClick={() => setShowAllCountries(!showAllCountries)}
                         variant="outline"
                         size={isMobile ? 'sm' : 'default'}
                         className="px-5"
                       >
                         {showAllCountries ? (
                           <>
                             <ChevronUp className="w-4 h-4 mr-2" />
                             {t('collapseCountries')}
                           </>
                         ) : (
                           <>
                             <ChevronDown className="w-4 h-4 mr-2" />
                             {t('showAllCountries', {count: countryOptions.length})}
                           </>
                         )}
                       </Button>
                     </div>
                   )}
                 </Card>
               )}
             </div>
           )}
           <DialogFooter className="mt-6">
             <Button 
               onClick={fetchCountryData} 
               disabled={loadingCountries} 
               variant="outline"
               size={isMobile ? 'sm' : 'default'}
             >
               {loadingCountries ? (
                 <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
               ) : (
                 <RotateCcw className="w-4 h-4 mr-2" />
               )}
               {t('refreshCountryList')}
             </Button>
             <Button 
               onClick={() => setShowIpModal(false)}
               variant="secondary"
               size={isMobile ? 'sm' : 'default'}
             >
               {t('cancel')}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
      </ResponsiveContainer>
    </>
  );
};

export default BulkWorkerDeployment;