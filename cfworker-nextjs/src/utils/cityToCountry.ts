import { TFunction } from 'i18next';

export interface CountryInfo { // Exporting for use in IpSelectionModal
  code: string;
  name: string;
  emoji: string;
}

export const getCityToCountry = (t: TFunction): Record<string, CountryInfo> => ({
  // Common Cloudflare PoP locations and their countries
  // This list can be expanded based on the expected values from STATS_API_ENDPOINT
  'AMS': { code: 'NL', name: t('countries.netherlands', 'Netherlands'), emoji: '🇳🇱' },
  'FRA': { code: 'DE', name: t('countries.germany', 'Germany'), emoji: '🇩🇪' },    // Frankfurt
  'LAX': { code: 'US', name: t('countries.usa', 'United States'), emoji: '🇺🇸' },  // Los Angeles
  'SIN': { code: 'SG', name: t('countries.singapore', 'Singapore'), emoji: '🇸🇬' },
  'NRT': { code: 'JP', name: t('countries.japan', 'Japan'), emoji: '🇯🇵' },      // Tokyo Narita
  'LHR': { code: 'GB', name: t('countries.uk', 'United Kingdom'), emoji: '🇬🇧' }, // London Heathrow
  'SYD': { code: 'AU', name: t('countries.australia', 'Australia'), emoji: '🇦🇺' },
  'GRU': { code: 'BR', name: t('countries.brazil', 'Brazil'), emoji: '🇧🇷' },      // São Paulo
  'HKG': { code: 'HK', name: t('countries.hongkong', 'Hong Kong'), emoji: '🇭🇰' },
  'CDG': { code: 'FR', name: t('countries.france', 'France'), emoji: '🇫🇷' },      // Paris
  'YYZ': { code: 'CA', name: t('countries.canada', 'Canada'), emoji: '🇨🇦' },      // Toronto
  'BOM': { code: 'IN', name: t('countries.india', 'India'), emoji: '🇮🇳' },        // Mumbai
  'JFK': { code: 'US', name: t('countries.usa', 'United States'), emoji: '🇺🇸' },  // New York JFK
  'EWR': { code: 'US', name: t('countries.usa', 'United States'), emoji: '🇺🇸' },  // Newark
  'ORD': { code: 'US', name: t('countries.usa', 'United States'), emoji: '🇺🇸' },  // Chicago O'Hare
  'ATL': { code: 'US', name: t('countries.usa', 'United States'), emoji: '🇺🇸' },  // Atlanta
  'DFW': { code: 'US', name: t('countries.usa', 'United States'), emoji: '🇺🇸' },  // Dallas/Fort Worth
  'SEA': { code: 'US', name: t('countries.usa', 'United States'), emoji: '🇺🇸' },  // Seattle
  'MIA': { code: 'US', name: t('countries.usa', 'United States'), emoji: '🇺🇸' },  // Miami
  'SFO': { code: 'US', name: t('countries.usa', 'United States'), emoji: '🇺🇸' },  // San Francisco
  'IAD': { code: 'US', name: t('countries.usa', 'United States'), emoji: '🇺🇸' },  // Washington Dulles
  'DEN': { code: 'US', name: t('countries.usa', 'United States'), emoji: '🇺🇸' },  // Denver
  // Europe
  'MAD': { code: 'ES', name: t('countries.spain', 'Spain'), emoji: '🇪🇸' },
  'MXP': { code: 'IT', name: t('countries.italy', 'Italy'), emoji: '🇮🇹' },        // Milan
  'WAW': { code: 'PL', name: t('countries.poland', 'Poland'), emoji: '🇵🇱' },      // Warsaw
  'VIE': { code: 'AT', name: t('countries.austria', 'Austria'), emoji: '🇦🇹' },    // Vienna
  'ZRH': { code: 'CH', name: t('countries.switzerland', 'Switzerland'), emoji: '🇨🇭' }, // Zurich
  'ARN': { code: 'SE', name: t('countries.sweden', 'Sweden'), emoji: '🇸🇪' },      // Stockholm
  'BRU': { code: 'BE', name: t('countries.belgium', 'Belgium'), emoji: '🇧🇪' },    // Brussels
  'CPH': { code: 'DK', name: t('countries.denmark', 'Denmark'), emoji: '🇩🇰' },    // Copenhagen
  'DUB': { code: 'IE', name: t('countries.ireland', 'Ireland'), emoji: '🇮🇪' },    // Dublin
  'HEL': { code: 'FI', name: t('countries.finland', 'Finland'), emoji: '🇫🇮' },    // Helsinki
  'LIS': { code: 'PT', name: t('countries.portugal', 'Portugal'), emoji: '🇵🇹' },  // Lisbon
  'OSL': { code: 'NO', name: t('countries.norway', 'Norway'), emoji: '🇳🇴' },      // Oslo
  'PRG': { code: 'CZ', name: t('countries.czechrepublic', 'Czech Republic'), emoji: '🇨🇿' }, // Prague
  // Add more as needed based on typical PoP locations and desired coverage
});
