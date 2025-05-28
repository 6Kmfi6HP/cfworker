'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { WORKER_NAME_WORDS } from '@/utils/constants'; // Assuming @ is src alias

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Globe, RefreshCw } from 'lucide-react';

// Zod Schema
export const workerFormSchema = z.object({
  workerName: z.string().optional(),
  uuid: z.string().uuid({ message: "Invalid UUID" }).optional().or(z.literal('')),
  nodeName: z.string().optional(),
  socks5Relay: z.boolean().optional().default(false),
  proxyIp: z.string().optional(),
  socks5Proxy: z.string().optional(),
  customDomain: z.string().optional(),
});

export type WorkerFormValues = z.infer<typeof workerFormSchema>;

interface WorkerFormProps {
  onWorkerCreated: (data: WorkerFormValues) => void; // Updated to pass full form data
  onShowBulkDeployment: () => void;
  onShowConfigManagement: () => void;
}

const countProxyIps = (ips: string | undefined): number => {
  if (!ips) return 0;
  return ips.split(',').filter(ip => ip.trim() !== '').length;
};

export function WorkerForm({
  onWorkerCreated,
  onShowBulkDeployment,
  onShowConfigManagement,
}: WorkerFormProps) {
  const { t, i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  const [socks5RelayEnabled, setSocks5RelayEnabled] = useState(false);
  const [proxyIpCount, setProxyIpCount] = useState(0);

  const form = useForm<WorkerFormValues>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      workerName: '',
      uuid: '',
      nodeName: '',
      socks5Relay: false,
      proxyIp: '',
      socks5Proxy: '',
      customDomain: '',
    },
  });

  const watchedProxyIp = form.watch('proxyIp');
  const watchedSocks5Proxy = form.watch('socks5Proxy');

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedData = localStorage.getItem('cfWorkerFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData) as Partial<WorkerFormValues>;
        form.reset(parsedData);
        if (parsedData.socks5Relay !== undefined) {
          setSocks5RelayEnabled(parsedData.socks5Relay);
        }
        if (parsedData.proxyIp !== undefined) {
          setProxyIpCount(countProxyIps(parsedData.proxyIp));
        }
      }
    } catch (error) {
      console.error("Failed to load form data from localStorage:", error);
    }
  }, [form]);

  // Save to localStorage on change (debounced)
  useEffect(() => {
    if (!isMounted) return; // Don't save during initial hydration before localStorage is read

    const subscription = form.watch((values) => {
      const debouncedSave = setTimeout(() => {
        localStorage.setItem('cfWorkerFormData', JSON.stringify(values));
      }, 500);
      return () => clearTimeout(debouncedSave);
    });
    return () => subscription.unsubscribe();
  }, [form, isMounted]);


  // Update proxyIpCount when watchedProxyIp changes
  useEffect(() => {
    if (!isMounted) return;
    setProxyIpCount(countProxyIps(watchedProxyIp));
  }, [watchedProxyIp, isMounted]);

  // Conditional logic for proxyIp and socks5Proxy
  useEffect(() => {
    if (!isMounted) return;
    if (!socks5RelayEnabled) {
      if (watchedProxyIp && form.getValues('socks5Proxy')) {
         form.setValue('socks5Proxy', '');
      }
    }
  }, [watchedProxyIp, socks5RelayEnabled, form, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    if (!socks5RelayEnabled) {
      if (watchedSocks5Proxy && form.getValues('proxyIp')) {
        form.setValue('proxyIp', '');
      }
    }
  }, [watchedSocks5Proxy, socks5RelayEnabled, form, isMounted]);


  const generateUUID = () => {
    form.setValue('uuid', uuidv4());
  };

  const generateWorkerName = () => {
    const randomWord1 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
    const randomWord2 = WORKER_NAME_WORDS[Math.floor(Math.random() * WORKER_NAME_WORDS.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    const newWorkerName = `${randomWord1}-${randomWord2}-${randomNumber}`;
    form.setValue('workerName', newWorkerName);
    form.setValue('nodeName', newWorkerName); // Sync nodeName
  };
  
  const handleSocks5RelayChange = (checked: boolean) => {
    setSocks5RelayEnabled(checked);
    form.setValue('socks5Relay', checked);
  };


  // Placeholder for submit handler
  const onSubmit = (data: WorkerFormValues) => {
    console.log("Form submitted (placeholder):", data);
    // onWorkerCreated(data); // This will be used later
  };

  if (!isMounted) {
    // Optional: render a loader or null while waiting for client-side mount to avoid hydration mismatches with localStorage
    return null; 
  }

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>{t('workerForm.additionalParams', 'Additional Parameters')}</AccordionTrigger>
              <AccordionContent className="space-y-4 px-1">
                <FormField
                  control={form.control}
                  name="workerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild><span>{t('workerForm.workerName', 'Worker Name')}</span></TooltipTrigger>
                          <TooltipContent><p>{t('workerForm.workerNameTooltip', 'Optional: Define a custom worker name.')}</p></TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input {...field} onChange={(e) => {
                            field.onChange(e);
                            form.setValue('nodeName', e.target.value);
                          }} />
                        </FormControl>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" onClick={generateWorkerName}><RefreshCw className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>{t('workerForm.generateNewName', 'Generate new name')}</p></TooltipContent>
                        </Tooltip>
                      </div>
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
                        <Tooltip>
                          <TooltipTrigger asChild><span>{t('workerForm.uuid', 'UUID')}</span></TooltipTrigger>
                          <TooltipContent><p>{t('workerForm.uuidTooltip', 'Optional: Define a custom UUID.')}</p></TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl><Input {...field} /></FormControl>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" onClick={generateUUID}><RefreshCw className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>{t('workerForm.generateNewUUID', 'Generate new UUID')}</p></TooltipContent>
                        </Tooltip>
                      </div>
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
                        <Tooltip>
                          <TooltipTrigger asChild><span>{t('workerForm.nodeName', 'Node Name')}</span></TooltipTrigger>
                          <TooltipContent><p>{t('workerForm.nodeNameTooltip', 'Optional: Define a custom node name for display.')}</p></TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl><Input {...field} /></FormControl>
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
                        <FormLabel>
                          <Tooltip>
                            <TooltipTrigger asChild><span>{t('workerForm.socks5Relay', 'SOCKS5 Relay')}</span></TooltipTrigger>
                            <TooltipContent><p>{t('workerForm.socks5RelayTooltip', 'Enable SOCKS5 relay mode.')}</p></TooltipContent>
                          </Tooltip>
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleSocks5RelayChange(checked);
                        }} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="proxyIp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              {t('workerForm.proxyIpLabel', { count: proxyIpCount, defaultValue: `Proxy IP (${proxyIpCount})` })}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent><p>{t('workerForm.proxyIpTooltip', 'Optional: Specify proxy IPs. Multiple IPs separated by comma.')}</p></TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder={!socks5RelayEnabled && form.getValues('socks5Proxy') 
                              ? t('workerForm.proxyIpPlaceholderDisabled', 'Disabled when SOCKS5 Proxy is used without relay')
                              : t('workerForm.proxyIpPlaceholder', 'e.g., cdn.example.com:443')}
                            disabled={!socks5RelayEnabled && !!form.getValues('socks5Proxy')}
                          />
                        </FormControl>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              type="button" 
                              variant="outline"
                              disabled={!socks5RelayEnabled && !!form.getValues('socks5Proxy')}
                              onClick={() => {/* TODO: Open IP Modal */ console.log("Open IP Modal clicked")}}
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              {t('workerForm.getProxyIpButton', 'Get IPs')}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>{t('workerForm.getProxyIpButtonTooltip', 'Fetch proxy IPs by country')}</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socks5Proxy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild><span>{t('workerForm.socks5Proxy', 'SOCKS5 Proxy')}</span></TooltipTrigger>
                          <TooltipContent><p>{t('workerForm.socks5ProxyTooltip', 'Optional: Specify SOCKS5 proxy. Format: user:pass@host:port')}</p></TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder={!socks5RelayEnabled && form.getValues('proxyIp')
                            ? t('workerForm.socks5ProxyPlaceholderDisabled', 'Disabled when Proxy IP is used without relay')
                            : t('workerForm.socks5ProxyPlaceholder', 'user:pass@host:port')}
                          disabled={!socks5RelayEnabled && !!form.getValues('proxyIp')}
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
                        <Tooltip>
                          <TooltipTrigger asChild><span>{t('workerForm.customDomain', 'Custom Domain')}</span></TooltipTrigger>
                          <TooltipContent><p>{t('workerForm.customDomainTooltip', 'Optional: Use your own domain for the worker.')}</p></TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('workerForm.customDomainPlaceholder', 'e.g., worker.yourdomain.com')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Submit button will be added in a later step */}
          {/* <Button type="submit">Submit (Placeholder)</Button> */}
        </form>
      </Form>
    </TooltipProvider>
  );
}
