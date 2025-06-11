import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  CloudUpload,
  Zap,
  RefreshCw,
  Trash2,
  Settings,
  Globe,
  ChevronUp,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../contexts/AccountContext';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINT, MAX_PROXY_IPS, STATS_API_ENDPOINT } from '../utils/constants';
import { getCityToCountry } from '../utils/cityToCountry';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { useToast } from '../hooks/use-toast';


const workerFormSchema = z.object({
  workerName: z.string().optional(),
  uuid: z.string().optional(),
  nodeName: z.string().optional(),
  socks5Relay: z.boolean().optional(),
  proxyIp: z.string().optional(),
  socks5Proxy: z.string().optional(),
  customDomain: z.string().optional(),
});

interface WorkerFormProps {
  onWorkerCreated: (node: string, url: string) => void;
  onShowBulkDeployment: () => void;
  onShowConfigManagement: () => void;
}

const WorkerForm: React.FC<WorkerFormProps> = ({
  onWorkerCreated,
  onShowBulkDeployment,
  onShowConfigManagement,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { getCurrentCredentials } = useAccount();
  const [loading, setLoading] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [fetchingIps, setFetchingIps] = useState(false);
  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string; count: number }[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);

  const form = useForm<z.infer<typeof workerFormSchema>>({
    resolver: zodResolver(workerFormSchema),
  });

  useEffect(() => {
    const savedFormData = localStorage.getItem('cfWorkerFormData');
    if (savedFormData) {
      try {
        form.reset(JSON.parse(savedFormData));
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
    fetchCountryData();
  }, [form]);

  const saveFormData = useCallback(() => {
    const currentValues = form.getValues();
    localStorage.setItem('cfWorkerFormData', JSON.stringify(currentValues));
  }, [form]);

  const fetchCountryData = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch(STATS_API_ENDPOINT);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const { byCity } = data;
      const countryMap: { [key: string]: { count: number; name: string; emoji: string } } = {};

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
        .map(([code, { count, name, emoji }]) => ({ value: code, label: `${emoji} ${name}`, count }))
        .sort((a, b) => b.count - a.count);

      setCountryOptions(options);
    } catch (error) {
      console.error('Error fetching country data:', error);
      toast({ title: t('fetchedIpsFail', { error: error instanceof Error ? error.message : String(error) }), variant: 'destructive' });
    } finally {
      setLoadingCountries(false);
    }
  };

  const createWorker = async (formData: z.infer<typeof workerFormSchema>) => {
    const credentials = getCurrentCredentials();
    if (!credentials) {
      toast({ title: t('pleaseSelectAccount'), variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const requestData = { ...formData, email: credentials.email, globalAPIKey: credentials.globalAPIKey };
      const filteredFormData = Object.fromEntries(Object.entries(requestData).filter(([_, value]) => value !== '' && value !== undefined));
      const { data } = await apiClient.post(API_ENDPOINT, filteredFormData);

      onWorkerCreated(data.node, data.url);
      toast({ title: t('workerCreationSuccess'), description: t('workerCreationSuccessDesc') });
    } catch (error: unknown) {
      console.error("创建 Worker 节点失败:", error);
      const errorMessage = error instanceof Error ? error.message : 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
         ? String(error.response.data.error) : String(error));
      toast({ title: t('workerCreationFail'), description: errorMessage, variant: 'destructive' });
    }
    setLoading(false);
  };

  // const generateUUID = () => form.setValue('uuid', uuidv4());
  // const generateWorkerName = () => {
  //   const randomWord1 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
  //   const randomWord2 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
  //   const randomNumber = Math.floor(Math.random() * 1000);
  //   form.setValue('workerName', `${randomWord1}-${randomWord2}-${randomNumber}`);
  // };

  const clearSavedData = () => {
    localStorage.removeItem('cfWorkerFormData');
    form.reset();
    toast({ title: t('dataClearedSuccess'), description: t('dataClearedSuccessDesc') });
  };

  const fetchIpsByCountry = async (countryCode: string) => {
    setFetchingIps(true);
    try {
      const response = await fetch(`https://bestip.06151953.xyz/country/${countryCode}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      let data = await response.json();
      if (data.length > MAX_PROXY_IPS) {
        data = data.sort(() => 0.5 - Math.random()).slice(0, MAX_PROXY_IPS);
      }
      const formattedIps = data.map((item: { ip: string; port: number }) => `${item.ip}:${item.port}`).join(',');
      form.setValue('proxyIp', formattedIps);
      toast({ title: t('fetchedIpsSuccess', { count: data.length, country: countryCode }), description: t('fetchedIpsSuccessDesc') });
      setShowIpModal(false);
    } catch (error) {
      console.error('Error fetching IPs:', error);
      toast({ title: t('fetchedIpsFail', { error: error instanceof Error ? error.message : String(error) }), variant: 'destructive' });
    } finally {
      setFetchingIps(false);
    }
  };

  return (
    <div className="p-4 bg-card rounded-lg border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(createWorker)} onChange={saveFormData} className="space-y-6">
          <div className="w-full">
            <div className="mb-4">
              <h3 className="text-lg font-medium">{t('additionalParams')}</h3>
            </div>
            <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="uuid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('uuid')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder={t('uuidPlaceholder')} {...field} />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                  onClick={() => form.setValue('uuid', uuidv4())}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('generateUuid')}</p>
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
                      <FormLabel>{t('nodeName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('nodeNamePlaceholder')} {...field} />
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
                      <FormLabel>{t('customDomain')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('customDomainPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="proxyIp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('proxyIp')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder={t('proxyIpPlaceholder')} {...field} />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                  onClick={() => setShowIpModal(true)}
                                >
                                  <Globe className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('selectProxyIpCountry')}</p>
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
                  name="socks5Proxy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('socks5Proxy')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('socks5ProxyPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="socks5Relay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t('socks5Relay')}</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {t('socks5RelayDescription')}
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button type="submit" disabled={loading} className="sm:col-span-1">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudUpload className="mr-2 h-4 w-4" />}
                {loading ? t('creating') : t('createWorkerNode')}
              </Button>
              <Button type="button" variant="secondary" onClick={onShowBulkDeployment}>
                <Zap className="mr-2 h-4 w-4" />
                {t('bulkDeploy')}
              </Button>
              <Button type="button" variant="secondary" onClick={onShowConfigManagement}>
                <Settings className="mr-2 h-4 w-4" />
                {t('configManagement')}
              </Button>
            </div>
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={clearSavedData}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('clearSavedData')}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={showIpModal} onOpenChange={setShowIpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('selectProxyIpCountry')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t('selectProxyIpDescription')} ({t('maxIpsInfo', { count: MAX_PROXY_IPS })})
            </p>
            {loadingCountries ? (
              <div className="text-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>{t('loadingCountries')}</p>
              </div>
            ) : (
              <div>
                <div className={cn("grid gap-2", showAllCountries ? "grid-cols-3" : "grid-cols-3 max-h-48 overflow-y-auto")}>
                  {countryOptions.slice(0, showAllCountries ? undefined : 9).map(option => (
                    <Button
                      key={option.value}
                      variant="outline"
                      disabled={fetchingIps}
                      onClick={() => fetchIpsByCountry(option.value)}
                      title={`${option.count} IPs available`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                {countryOptions.length > 9 && (
                  <div className="text-center mt-4">
                    <Button variant="link" onClick={() => setShowAllCountries(!showAllCountries)}>
                      {showAllCountries ? t('collapseCountries') : t('showAllCountries', { count: countryOptions.length })}
                      {showAllCountries ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowIpModal(false)}>{t('cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerForm;