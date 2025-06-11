import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  CloudUpload,
  PlayCircle,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
  Globe,
  History,
} from 'lucide-react';
import { useAccount } from '../contexts/AccountContext';
import { apiClient } from '../services/apiClient';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINT, STATS_API_ENDPOINT, WORKER_NAME_WORDS } from '../utils/constants';
import { getCityToCountry } from '../utils/cityToCountry';
import { v4 as uuidv4 } from 'uuid';

import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Sheet, SheetContent } from './ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

import { Separator } from './ui/separator';


const deploymentFormSchema = z.object({
  workerNameBase: z.string().min(1, 'workerNameBaseRequired'),
  targetAccounts: z.array(z.string()).min(1, 'targetAccountsRequired'),
  uuid: z.string().optional(),
  nodeName: z.string().optional(),
  socks5Relay: z.boolean().optional(),
  proxyIp: z.string().optional(),
  socks5Proxy: z.string().optional(),
  customDomain: z.string().optional(),
});

// ... (interfaces remain the same)

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
  formData: z.infer<typeof deploymentFormSchema>;
}

interface BulkWorkerDeploymentProps {
  visible: boolean;
  onClose: () => void;
}

const BulkWorkerDeployment: React.FC<BulkWorkerDeploymentProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { accounts } = useAccount();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof deploymentFormSchema>>({
    resolver: zodResolver(deploymentFormSchema),
    defaultValues: {
      targetAccounts: [],
    },
  });

  const [deploymentTargets, setDeploymentTargets] = useState<DeploymentTarget[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [currentDeployingAccount, setCurrentDeployingAccount] = useState<string>('');
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [activeTab, setActiveTab] = useState('deployment');
  
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentHistoryRecord[]>([]);
  
  const [showIpModal, setShowIpModal] = useState(false);
  // Removed unused state variables: fetchingIps, setFetchingIps, countryOptions, loadingCountries

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedFormData = localStorage.getItem('cfBulkWorkerFormData');
    if (savedFormData) {
      try {
        form.reset(JSON.parse(savedFormData));
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
    loadDeploymentHistory();
    fetchCountryData();
  }, [form]);

  const loadDeploymentHistory = () => {
    const savedHistory = localStorage.getItem('cfBulkDeploymentHistory');
    if (savedHistory) {
      try {
        setDeploymentHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading deployment history:', error);
      }
    }
  };

  const saveDeploymentHistory = (newRecord: DeploymentHistoryRecord) => {
    const updatedHistory = [newRecord, ...deploymentHistory].slice(0, 50);
    setDeploymentHistory(updatedHistory);
    localStorage.setItem('cfBulkDeploymentHistory', JSON.stringify(updatedHistory));
  };

  // const clearDeploymentHistory = () => {
  //   setDeploymentHistory([]);
  //   localStorage.removeItem('cfBulkDeploymentHistory');
  //   toast({
  //     title: t('deploymentHistoryCleared'),
  //     description: t('deploymentHistoryClearedDesc'),
  //   });
  // };

  const saveFormData = useCallback(() => {
    const currentValues = form.getValues();
    localStorage.setItem('cfBulkWorkerFormData', JSON.stringify(currentValues));
  }, [form]);

  const fetchCountryData = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch(STATS_API_ENDPOINT);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

  const generateUUID = () => form.setValue('uuid', uuidv4());
  const generateWorkerNameBase = () => {
    const randomWord1 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
    const randomWord2 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
    form.setValue('workerNameBase', `${randomWord1}-${randomWord2}`);
  };

  // const fetchIpsByCountry = async (countryCode: string) => {
  //   setFetchingIps(true);
  //   try {
  //     const response = await fetch(`https://bestip.06151953.xyz/country/${countryCode}`);
  //     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  //     let data = await response.json();
  //     
  //     if (data.length > MAX_PROXY_IPS) {
  //       data = data.sort(() => 0.5 - Math.random()).slice(0, MAX_PROXY_IPS);
  //     }
  //     
  //     const formattedIps = data.map((item: { ip: string; port: number }) => `${item.ip}:${item.port}`).join(',');
  //     form.setValue('proxyIp', formattedIps);
  //     
  //     toast({ title: t('fetchedIpsSuccess', { count: data.length, country: countryCode }), description: t('fetchedIpsSuccessDesc') });
  //     setShowIpModal(false);
  //   } catch (error) {
  //     console.error('Error fetching IPs:', error);
  //     toast({ title: t('fetchedIpsFail', { error: error instanceof Error ? error.message : String(error) }), variant: 'destructive' });
  //   } finally {
  //   setFetchingIps(false);
  // }
  // };

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

  const deployToAccount = async (target: DeploymentTarget, formData: z.infer<typeof deploymentFormSchema>, index: number): Promise<{ workerUrl: string; deploymentTime: number; workerName: string }> => {
    const account = accounts.find(acc => acc.id === target.accountId);
    if (!account) throw new Error('Account not found');

    const startTime = Date.now();
    const workerName = `${formData.workerNameBase}-${index + 1}`;
    
    const deploymentData = { ...formData, workerName, email: account.email, globalAPIKey: account.globalAPIKey };
    const filteredFormData = Object.fromEntries(Object.entries(deploymentData).filter(([_, value]) => value !== '' && value !== undefined));
    
    const response = await apiClient.post(API_ENDPOINT, filteredFormData);
    const deploymentTime = Date.now() - startTime;
    
    return { workerUrl: response.data.url, deploymentTime, workerName };
  };

  const handleBulkDeploy = async (values: z.infer<typeof deploymentFormSchema>) => {
    if (deploymentTargets.length === 0) {
      toast({ title: t('targetAccountsRequired'), variant: 'destructive' });
      return;
    }

    setIsDeploying(true);
    setDeploymentProgress(0);
    const deploymentStartTime = Date.now();

    for (let i = 0; i < deploymentTargets.length; i++) {
      const target = deploymentTargets[i];
      setCurrentDeployingAccount(target.accountName);
      setDeploymentTargets(prev => prev.map(t => t.accountId === target.accountId ? { ...t, status: 'deploying' } : t));

      try {
        const result = await deployToAccount(target, values, i);
        setDeploymentTargets(prev => prev.map(t => t.accountId === target.accountId ? { ...t, status: 'success', ...result } : t));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 
          (error && typeof error === 'object' && 'response' in error && 
           error.response && typeof error.response === 'object' && 'data' in error.response &&
           error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
           ? String(error.response.data.error) : 'Deployment failed');
        setDeploymentTargets(prev => prev.map(t => t.accountId === target.accountId ? { ...t, status: 'error', error: errorMessage } : t));
      }
      setDeploymentProgress(((i + 1) / deploymentTargets.length) * 100);
    }

    setCurrentDeployingAccount('');
    setIsDeploying(false);
    
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
        toast({ title: t('bulkDeploymentCompleted'), description: t('bulkDeploymentCompletedDesc', { successCount, errorCount }) });
        return currentTargets;
      });
    }, 100);
  };

  const getStatusIcon = (status: DeploymentTarget['status']) => {
    const iconClass = "h-4 w-4";
    switch (status) {
      case 'pending': return <Info className={cn(iconClass, "text-blue-500")} />;
      case 'deploying': return <PlayCircle className={cn(iconClass, "text-yellow-500")} />;
      case 'success': return <CheckCircle className={cn(iconClass, "text-green-500")} />;
      case 'error': return <XCircle className={cn(iconClass, "text-red-500")} />;
      default: return null;
    }
  };

  // const paginatedHistory = deploymentHistory.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize);
  const successCount = deploymentTargets.filter(t => t.status === 'success').length;
  const errorCount = deploymentTargets.filter(t => t.status === 'error').length;

  const MainContainer = isMobile ? Sheet : Dialog;
  const MainContent = isMobile ? SheetContent : DialogContent;
  const mainContainerProps = isMobile
    ? { open: visible, onOpenChange: onClose }
    : { open: visible, onOpenChange: onClose };
  const mainContentProps = isMobile
    ? { className: "h-[90vh] flex flex-col p-0", side: 'bottom' as const }
    : { className: "max-w-6xl h-[90vh] flex flex-col p-0" };

  return (
    <>
      <MainContainer {...mainContainerProps}>
        <MainContent {...mainContentProps}>
            <DialogHeader className="p-4 border-b">
              <DialogTitle>{t('bulkWorkerDeployment')}</DialogTitle>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-4 mt-4">
                <TabsTrigger value="deployment"><CloudUpload className="mr-2 h-4 w-4"/>{t('bulkDeployment')}</TabsTrigger>
                <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>{t('deploymentHistory')}</TabsTrigger>
              </TabsList>
              <TabsContent value="deployment" className="flex-1 overflow-y-auto p-4 space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleBulkDeploy)} onChange={saveFormData} className="space-y-4">
                    <FormField name="workerNameBase" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('workerNameBase')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder={t('workerNameBasePlaceholder')} {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={generateWorkerNameBase}><RefreshCw className="h-4 w-4"/></Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <div className="w-full">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium">{t('additionalParams')}</h3>
                      </div>
                      <div className="space-y-4">
                          <FormField name="uuid" control={form.control} render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{t('uuid')}</FormLabel>
                                  <FormControl>
                                      <div className="relative">
                                          <Input placeholder={t('uuidPlaceholder')} {...field} />
                                          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={generateUUID}><RefreshCw className="h-4 w-4"/></Button>
                                      </div>
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <FormField name="nodeName" control={form.control} render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{t('nodeName')}</FormLabel>
                                  <FormControl><Input placeholder={t('nodeNamePlaceholder')} {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <FormField name="customDomain" control={form.control} render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{t('customDomain')}</FormLabel>
                                  <FormControl><Input placeholder={t('customDomainPlaceholder')} {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <FormField name="proxyIp" control={form.control} render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{t('proxyIp')}</FormLabel>
                                  <FormControl>
                                      <div className="relative">
                                          <Input placeholder={t('proxyIpPlaceholder')} {...field} />
                                          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowIpModal(true)}><Globe className="h-4 w-4"/></Button>
                                      </div>
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <FormField name="socks5Proxy" control={form.control} render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{t('socks5Proxy')}</FormLabel>
                                  <FormControl><Input placeholder={t('socks5ProxyPlaceholder')} {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <FormField name="socks5Relay" control={form.control} render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                      <FormLabel>{t('socks5Relay')}</FormLabel>
                                  </div>
                                  <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                              </FormItem>
                          )} />
                      </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="targetAccounts"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('targetAccounts')}</FormLabel>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <FormControl>
                                <Button variant="outline" className="w-full justify-start">
                                    {field.value?.length > 0
                                    ? `${field.value.length} ${t('accountsSelected')}`
                                    : t('selectTargetAccounts')}
                                </Button>
                                </FormControl>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {accounts.filter(a => a.isActive).map(acc => (
                                <DropdownMenuCheckboxItem
                                    key={acc.id}
                                    checked={field.value?.includes(acc.id)}
                                    onCheckedChange={(checked) => {
                                    const newValue = checked
                                        ? [...(field.value || []), acc.id]
                                        : field.value?.filter((id) => id !== acc.id);
                                    field.onChange(newValue);
                                    handleAccountSelection(newValue || []);
                                    }}
                                >
                                    {acc.name || acc.email}
                                </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                            </DropdownMenu>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    {deploymentTargets.length > 0 && (
                      <Card>
                        <CardHeader><CardTitle>{t('deploymentTargets')}</CardTitle></CardHeader>
                        <CardContent>
                          {isDeploying && (
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between items-center">
                                <p className="font-semibold">{t('deploymentProgress')}</p>
                                {currentDeployingAccount && <p className="text-sm text-muted-foreground">{t('currentlyDeploying')}: {currentDeployingAccount}</p>}
                              </div>
                              <Progress value={deploymentProgress} />
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-green-600 border-green-600">{t('success')}: {successCount}</Badge>
                                <Badge variant="outline" className="text-red-600 border-red-600">{t('error')}: {errorCount}</Badge>
                                <Badge variant="outline">{t('total')}: {deploymentTargets.length}</Badge>
                              </div>
                            </div>
                          )}
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{t('account')}</TableHead>
                                <TableHead>{t('workerName')}</TableHead>
                                <TableHead>{t('status')}</TableHead>
                                <TableHead>{t('result')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {deploymentTargets.map(target => (
                                <TableRow key={target.accountId}>
                                  <TableCell>
                                    <p className="font-medium">{target.accountName}</p>
                                    <p className="text-sm text-muted-foreground">{target.accountEmail}</p>
                                  </TableCell>
                                  <TableCell>{target.workerName || '-'}</TableCell>
                                  <TableCell><div className="flex items-center gap-2">{getStatusIcon(target.status)} {t(target.status)}</div></TableCell>
                                  <TableCell>
                                    {target.status === 'success' && target.workerUrl ? <a href={target.workerUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{t('viewWorker')}</a> : null}
                                    {target.status === 'error' && target.error ? <TooltipProvider><Tooltip><TooltipTrigger><p className="text-red-500 truncate max-w-xs">{target.error}</p></TooltipTrigger><TooltipContent>{target.error}</TooltipContent></Tooltip></TooltipProvider> : null}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                    <Separator />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isDeploying || deploymentTargets.length === 0}><CloudUpload className="mr-2 h-4 w-4"/>{isDeploying ? t('deploying') : t('startDeployment')}</Button>
                      <Button type="button" variant="ghost" onClick={onClose}>{t('cancel')}</Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="history" className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* History content here */}
              </TabsContent>
            </Tabs>
        </MainContent>
      </MainContainer>

      <Dialog open={showIpModal} onOpenChange={setShowIpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('selectProxyIpCountry')}</DialogTitle>
          </DialogHeader>
          {/* IP Modal Content */}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowIpModal(false)}>{t('cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkWorkerDeployment;