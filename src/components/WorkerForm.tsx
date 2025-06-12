import React, { useCallback, useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import {
  ChevronDownIcon,
  BoltIcon,
  Cog6ToothIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronUpIcon,
  ChevronDownIcon as ChevronDownIconSolid,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { notification } from "../utils/notifications";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../contexts/AccountContext';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINT, MAX_PROXY_IPS, STATS_API_ENDPOINT, WORKER_NAME_WORDS } from '../utils/constants';
import { getCityToCountry } from '../utils/cityToCountry';

const formSchema = z.object({
  workerName: z.string().optional(),
  uuid: z.string().optional(),
  nodeName: z.string().optional(),
  proxyIp: z.string().optional(),
  socks5Proxy: z.string().optional(),
  socks5Relay: z.boolean().optional(),
  customDomain: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

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
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workerName: '',
      uuid: '',
      nodeName: '',
      proxyIp: '',
      socks5Proxy: '',
      socks5Relay: false,
      customDomain: '',
    },
  });
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
      form.reset(parsedData);
      
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
        const cityInfo = getCityToCountry((key: string, fallback?: string) => t(key, fallback || ''))[city as keyof ReturnType<typeof getCityToCountry>];
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
        message: t('error'),
        description: t('fetchedIpsFail', { error: error instanceof Error ? error.message : String(error) })
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

  // Create worker
  const createWorker = useCallback(async (formData: FormData) => {
    const credentials = getCurrentCredentials();
    if (!credentials) {
      notification.error({
        message: t('error'),
        description: t('pleaseSelectAccount', 'Please select an account first')
      });
      return;
    }

    setLoading(true);
    try {
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
        description: t('workerCreationSuccessDesc', 'Worker node has been successfully created and deployed.')
      });
    } catch (error: any) {
      console.error("创建 Worker 节点失败:", error);
      if (error.response?.data?.message) {
        notification.error({
          message: t('error'),
          description: t('workerCreationFail') + ": " + error.response.data.error
        });
      } else {
        notification.error({
        message: t('error'),
        description: t('workerCreationFail') + ": " + (error instanceof Error ? error.message : String(error))
      });
      }
    }

    setLoading(false);
  }, [t, getCurrentCredentials, onWorkerCreated]);

  const onSubmit = form.handleSubmit(createWorker);

  // Generate UUID
  const generateUUID = () => {
    const newUUID = uuidv4();
    form.setValue('uuid', newUUID);
  };

  // Generate worker name
  const generateWorkerName = () => {
    const randomWord1 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
    const randomWord2 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    const newWorkerName = `${randomWord1}-${randomWord2}-${randomNumber}`;
    form.setValue('workerName', newWorkerName);
  };

  // Clear saved data
  const clearSavedData = () => {
    localStorage.removeItem('cfWorkerFormData');
    form.reset();
    setProxyIp('');
    setSocks5Proxy('');
    setProxyIpCount(0);
    setSocks5RelayEnabled(false);
    notification.success({
      message: t('dataClearedSuccess'),
      description: t('dataClearedSuccessDesc', 'All saved form data has been cleared successfully.')
    });
  };

  // Handle proxy IP change
  const handleProxyIpChange = (value: string) => {
    setProxyIp(value);
    form.setValue('proxyIp', value);
    const ips = value ? value.split(',').filter(ip => ip.trim() !== '').length : 0;
    setProxyIpCount(ips);
    if (value && !socks5RelayEnabled) {
      form.setValue('socks5Proxy', '');
      setSocks5Proxy('');
    }
  };

  // Handle socks5 proxy change
  const handleSocks5ProxyChange = (value: string) => {
    setSocks5Proxy(value);
    form.setValue('socks5Proxy', value);
    if (value && !socks5RelayEnabled) {
      form.setValue('proxyIp', '');
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
      form.setValue('proxyIp', newValue);
      setProxyIpCount(limitedData.length);
      
      notification.success({
        message: t('fetchedIpsSuccess', { count: limitedData.length, country: countryCode }),
        description: t('fetchedIpsSuccessDesc', 'Proxy IPs have been automatically filled in the form.')
      });
      setShowIpModal(false);
    } catch (error) {
      console.error('Error fetching IPs:', error);
      notification.error({
        message: t('error'),
        description: t('fetchedIpsFail', { error: error instanceof Error ? error.message : String(error) })
      });
    } finally {
      setFetchingIps(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
        <Collapsible defaultOpen className="mb-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="font-medium">{t('additionalParams')}</span>
            <ChevronDownIcon className="h-4 w-4 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 space-y-4">
            <FormField
              control={form.control}
              name="workerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{t('workerName')}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('workerNameTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e);
                          form.setValue('nodeName', e.target.value);
                        }}
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={generateWorkerName}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            >
                              <ArrowPathIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('workerNameTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uuid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{t('uuid')}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('uuidTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} value={field.value || ''} />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={generateUUID}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            >
                              <ArrowPathIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('uuidTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nodeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{t('nodeName')}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('nodeNameTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socks5Relay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{t('socks5Relay')}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('socks5RelayTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setSocks5RelayEnabled(checked);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!form.watch('socks5Relay') && (
              <FormField
                control={form.control}
                name="proxyIp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{t('proxyIp')}{proxyIpCount > 0 ? ` (${proxyIpCount})` : ''}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('proxyIpTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input
                          {...field}
                          value={field.value || ''}
                          placeholder={!!socks5Proxy && !socks5RelayEnabled
                            ? "Proxy IP is disabled when using Socks5 proxy" 
                            : "Example: cdn.xn--b6gac.eu.org:443 or 1.1.1.1:7443,2.2.2.2:443,[2a01:4f8:c2c:123f:64:5:6810:c55a]"
                          }
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            handleProxyIpChange(e.target.value);
                          }}
                          disabled={socks5RelayEnabled ? false : (!!socks5Proxy)}
                          className="rounded-r-none"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowIpModal(true)}
                          disabled={socks5RelayEnabled ? false : (!!socks5Proxy)}
                          className="rounded-l-none border-l-0 px-3"
                        >
                          <GlobeAltIcon className="h-4 w-4 mr-2" />
                          {t('getProxyIp')}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="socks5Proxy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{t('socks5Proxy')}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('socks5ProxyTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder={!!proxyIp && !socks5RelayEnabled
                        ? "Socks5 proxy is disabled when using proxy IP without relay" 
                        : "Example: user:pass@host:port or user1:pass1@host1:port1,user2:pass2@host2:port2"
                      }
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        handleSocks5ProxyChange(e.target.value);
                      }}
                      disabled={socks5RelayEnabled ? false : (!!proxyIp && !socks5RelayEnabled)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customDomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{t('customDomain')}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('customDomainTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder="Example: edtunnel.test.com NOTE: You must owner this domain."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        <div className="flex flex-col gap-4 mt-6">
          {/* 主要操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BoltIcon className="h-4 w-4 mr-2" />
              )}
              {t('createWorkerNode')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onShowBulkDeployment}
              className="flex-1 min-w-[150px]"
            >
              <BoltIcon className="h-4 w-4 mr-2" />
              {t('bulkDeploy', 'Bulk Deploy')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onShowConfigManagement}
              className="flex-1 min-w-[150px]"
            >
              <Cog6ToothIcon className="h-4 w-4 mr-2" />
              {t('configManagement', 'Config')}
            </Button>
          </div>
          
          {/* 清除数据按钮 */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="destructive"
              onClick={clearSavedData}
              className="w-auto px-6"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {t('clearSavedData')}
            </Button>
          </div>
        </div>
        </form>
      </Form>

      {/* IP Selection Dialog */}
      <Dialog open={showIpModal} onOpenChange={setShowIpModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('selectProxyIpCountry')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('selectProxyIpDescription')}
              <br />
              <small>({t('maxIpsInfo', { count: MAX_PROXY_IPS })})</small>
            </p>
            
            {loadingCountries ? (
              <div className="text-center p-8 bg-muted rounded-lg">
                <div className="mb-2 text-base flex items-center justify-center">
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin text-primary" />
                  {t('loadingCountries')}
                </div>
                <div className="text-muted-foreground text-sm">
                  {t('inferringCountries')}
                </div>
              </div>
            ) : (
              <div>
                {countryOptions.length === 0 ? (
                  <div className="text-center p-8 bg-muted rounded-lg text-destructive">
                    <div className="text-base">
                      {t('noCountriesFound')}
                    </div>
                  </div>
                ) : (
                  <div className={`grid grid-cols-3 gap-3 ${showAllCountries ? 'max-h-none' : 'max-h-[300px] overflow-hidden'}`}>
                    {countryOptions
                      .slice(0, showAllCountries ? countryOptions.length : 9)
                      .map(option => (
                        <Button 
                          key={option.value}
                          variant="outline"
                          className="h-12 text-sm justify-start"
                          title={`${option.count} IPs available`}
                          disabled={fetchingIps}
                          onClick={() => fetchIpsByCountry(option.value)}
                        >
                          <span className="truncate">
                            {option.label}
                          </span>
                        </Button>
                      ))}
                  </div>
                )}
                {countryOptions.length > 9 && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="outline"
                      onClick={() => setShowAllCountries(!showAllCountries)}
                      className="rounded-full px-5 h-8"
                    >
                      {showAllCountries ? (
                        <ChevronUpIcon className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronDownIconSolid className="h-4 w-4 mr-2" />
                      )}
                      {showAllCountries 
                        ? t('collapseCountries') 
                        : t('showAllCountries', {count: countryOptions.length})}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={fetchCountryData} 
              disabled={loadingCountries}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              {t('refreshCountryList')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => setShowIpModal(false)}
            >
              {t('cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerForm;