'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, RefreshCw, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MAX_PROXY_IPS, STATS_API_ENDPOINT } from '@/utils/constants';
import { getCityToCountry, CountryInfo } from '@/utils/cityToCountry';

interface IpSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIp: (ip: string) => void;
}

interface CountryOption extends CountryInfo {
  cityCode: string; // To store the original city code like 'AMS'
  count: number;
}

export function IpSelectionModal({ isOpen, onClose, onSelectIp }: IpSelectionModalProps) {
  const { t, i18n } = useTranslation();
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [fetchingIpsFor, setFetchingIpsFor] = useState<string | null>(null); // Stores countryCode being fetched
  const [showAllCountries, setShowAllCountries] = useState(false);

  const cityToCountryMap = getCityToCountry(t);

  const fetchCountryData = useCallback(async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch(STATS_API_ENDPOINT);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      const cityCounts: Record<string, number> = {};
      if (data && data.cities) {
        data.cities.forEach((city: { name: string; count: number }) => {
          cityCounts[city.name.toUpperCase()] = city.count;
        });
      }
      
      const options = Object.entries(cityCounts)
        .map(([cityCode, count]) => {
          const countryDetails = cityToCountryMap[cityCode];
          if (countryDetails) {
            return {
              ...countryDetails,
              cityCode: cityCode, // Keep original city code for API calls if needed
              count: count,
            };
          }
          return null;
        })
        .filter((option): option is CountryOption => option !== null)
        .sort((a, b) => b.count - a.count);

      setCountryOptions(options);
    } catch (error) {
      console.error('Failed to fetch country data:', error);
      toast.error(t('ipModal.noCountriesFound', 'Failed to load country data.'));
      setCountryOptions([]);
    } finally {
      setLoadingCountries(false);
    }
  }, [t, cityToCountryMap]); // cityToCountryMap depends on t

  useEffect(() => {
    if (isOpen && countryOptions.length === 0) {
      fetchCountryData();
    }
  }, [isOpen, countryOptions.length, fetchCountryData]);
  
  // Refetch if language changes
  useEffect(() => {
    if (isOpen) { // Only refetch if modal is open
        fetchCountryData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, isOpen]); // fetchCountryData is memoized with `t`

  const fetchIpsByCountry = async (countryCode: string, countryName: string) => {
    setFetchingIpsFor(countryCode);
    toast.info(t('ipModal.fetchingIps', { countryName }));
    try {
      const response = await fetch(`https://bestip.06151953.xyz/country/${countryCode}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const textData = await response.text();
      const ips = textData.split('\n').filter(ip => ip.trim() !== '').slice(0, MAX_PROXY_IPS);
      
      if (ips.length === 0) {
        toast.error(t('ipModal.fetchError', { countryName: `No IPs found for ${countryName}.` }));
        return;
      }

      onSelectIp(ips.join(','));
      toast.success(t('ipModal.fetchSuccess', { countryName }));
      onClose();
    } catch (error) {
      console.error(`Failed to fetch IPs for ${countryCode}:`, error);
      toast.error(t('ipModal.fetchError', { countryName }));
    } finally {
      setFetchingIpsFor(null);
    }
  };

  const displayedCountries = showAllCountries ? countryOptions : countryOptions.slice(0, 9);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('ipModal.title')}</DialogTitle>
          <DialogDescription>
            {t('ipModal.description', { count: MAX_PROXY_IPS })}
          </DialogDescription>
        </DialogHeader>

        {loadingCountries && (
          <div className="space-y-2 mt-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {!loadingCountries && countryOptions.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">
            {t('ipModal.noCountriesFound')}
          </p>
        )}

        {!loadingCountries && countryOptions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 overflow-y-auto pr-2">
            {displayedCountries.map((country) => (
              <Button
                key={country.code + country.cityCode} // Ensure unique key if same country code appears for different cities (though map structure prevents this)
                variant="outline"
                className="justify-start px-3 py-2 h-auto text-left"
                onClick={() => fetchIpsByCountry(country.code, country.name)}
                disabled={!!fetchingIpsFor}
              >
                {fetchingIpsFor === country.code ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="mr-2 text-lg">{country.emoji}</span>
                )}
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{country.name}</span>
                    <span className="text-xs text-muted-foreground">({country.cityCode} - {country.count})</span>
                </div>
              </Button>
            ))}
          </div>
        )}
        
        {!loadingCountries && countryOptions.length > 9 && (
          <div className="mt-4 flex justify-center">
            <Button variant="ghost" onClick={() => setShowAllCountries(!showAllCountries)}>
              {showAllCountries ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  {t('ipModal.collapseCountries')}
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  {t('ipModal.showAllCountries')}
                </>
              )}
            </Button>
          </div>
        )}

        <DialogFooter className="mt-auto pt-4">
          <Button variant="outline" onClick={fetchCountryData} disabled={loadingCountries || !!fetchingIpsFor}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingCountries ? 'animate-spin' : ''}`} />
            {t('ipModal.refreshList')}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">{t('ipModal.cancel')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
