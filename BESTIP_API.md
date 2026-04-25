# BestIP API Documentation

## Overview

The BestIP API (`https://bestip.06151953.xyz/`) provides access to a collection of proxy IP addresses organized by geographic location. This API is used in the Cloudflare Worker deployment application to fetch available proxy IPs for different countries.

**Base URL:** `https://bestip.06151953.xyz`

## API Endpoints

### 1. Get IP Statistics

Retrieves statistics about available proxy IPs grouped by city.

**Endpoint:** `/api/stats`

**Method:** `GET`

**Request:**
```http
GET https://bestip.06151953.xyz/api/stats
```

**Response:**
```json
{
  "byCity": {
    "Amsterdam": 150,
    "Atlanta": 89,
    "Chicago": 112,
    "Dallas": 95,
    "Frankfurt": 178,
    "HongKong": 203,
    "LosAngeles": 134,
    "London": 167,
    "Miami": 78,
    "NewYork": 145,
    "Paris": 156,
    "Seattle": 98,
    "Singapore": 189,
    "Sydney": 102,
    "Tokyo": 221,
    "Toronto": 87
  }
}
```

**Response Fields:**
- `byCity` (object): An object mapping city names to the number of available proxy IPs in that location

**Usage in Application:**

This endpoint is used in:
- `src/components/WorkerForm.tsx:93`
- `src/components/BulkWorkerDeployment.tsx:195`

The application fetches this data to display available countries with their IP counts, allowing users to select a country to fetch proxy IPs from.

**Example Implementation:**
```typescript
const response = await fetch('https://bestip.06151953.xyz/api/stats');
const data = await response.json();
const { byCity } = data;

// Process cities into countries
const countryMap: {[key: string]: {count: number, name: string, emoji: string}} = {};

Object.entries(byCity).forEach(([city, count]) => {
  const cityInfo = getCityToCountry(t)[city];
  if (cityInfo) {
    const { code, name, emoji } = cityInfo;
    if (!countryMap[code]) {
      countryMap[code] = { count: 0, name, emoji };
    }
    countryMap[code].count += count as number;
  }
});
```

---

### 2. Get Proxy IPs by Country

Retrieves a list of available proxy IP addresses for a specific country.

**Endpoint:** `/country/{countryCode}`

**Method:** `GET`

**URL Parameters:**
- `countryCode` (string, required): Two-letter ISO country code (e.g., `US`, `JP`, `GB`, `DE`, `SG`)

**Request:**
```http
GET https://bestip.06151953.xyz/country/US
```

**Response:**
```json
[
  {
    "ip": "104.18.32.167",
    "port": 443
  },
  {
    "ip": "104.18.33.167",
    "port": 443
  },
  {
    "ip": "172.67.180.123",
    "port": 8080
  },
  {
    "ip": "172.67.181.45",
    "port": 8443
  }
]
```

**Response Fields:**
- Array of proxy IP objects:
  - `ip` (string): The IP address of the proxy
  - `port` (number): The port number for the proxy

**Usage in Application:**

This endpoint is used in:
- `src/components/WorkerForm.tsx:242`
- `src/components/BulkWorkerDeployment.tsx:284`

The application fetches IPs for a selected country and automatically fills them into the proxy IP form field.

**Example Implementation:**
```typescript
const countryCode = 'US';
const response = await fetch(`https://bestip.06151953.xyz/country/${countryCode}`);
const data = await response.json();

// Limit to MAX_PROXY_IPS (default: 50)
let limitedData = [...data];
if (limitedData.length > MAX_PROXY_IPS) {
  // Shuffle array
  for (let i = limitedData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [limitedData[i], limitedData[j]] = [limitedData[j], limitedData[i]];
  }
  limitedData = limitedData.slice(0, MAX_PROXY_IPS);
}

// Format as comma-separated string
const formattedIps = limitedData.map((item: { ip: string; port: number }) =>
  `${item.ip}:${item.port}`
).join(',');
```

---

## Supported Country Codes

The API supports fetching proxy IPs for various countries. Common country codes include:

| Country Code | Country Name |
|--------------|--------------|
| US | United States |
| GB | United Kingdom |
| DE | Germany |
| FR | France |
| JP | Japan |
| SG | Singapore |
| AU | Australia |
| CA | Canada |
| NL | Netherlands |
| HK | Hong Kong |

*Note: The full list of supported countries can be determined by fetching the `/api/stats` endpoint and mapping the cities to their respective country codes.*

---

## Error Handling

### HTTP Status Codes

- `200 OK`: Request successful
- `404 Not Found`: Endpoint or country code not found
- `500 Internal Server Error`: Server error

### Error Handling in Application

The application implements error handling as follows:

```typescript
try {
  const response = await fetch(STATS_API_ENDPOINT);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  // Process data...
} catch (error) {
  console.error('Error fetching country data:', error);
  message.error(t('fetchedIpsFail', {
    error: error instanceof Error ? error.message : String(error)
  }));

  // Fallback to default countries
  setCountryOptions([
    { label: '🇺🇸 United States', value: 'US', count: 0 },
    { label: '🇯🇵 Japan', value: 'JP', count: 0 },
    { label: '🇬🇧 United Kingdom', value: 'GB', count: 0 },
    { label: '🇩🇪 Germany', value: 'DE', count: 0 },
    { label: '🇸🇬 Singapore', value: 'SG', count: 0 }
  ]);
}
```

---

## Rate Limiting

The API does not currently enforce strict rate limiting, but it's recommended to:

1. **Cache statistics data**: The `/api/stats` endpoint data doesn't change frequently. Consider caching responses for at least 5-10 minutes.
2. **Avoid excessive requests**: When fetching IPs by country, implement user-triggered actions rather than automatic polling.
3. **Implement retry logic**: For failed requests, use exponential backoff before retrying.

---

## Application Configuration

### Constants

The following constants are used in the application (defined in `src/utils/constants.ts`):

```typescript
// API endpoint for statistics
export const STATS_API_ENDPOINT = "https://bestip.06151953.xyz/api/stats";

// Maximum number of proxy IPs to fetch per request
export const MAX_PROXY_IPS = parseInt(
  import.meta.env.VITE_MAX_PROXY_IPS || "50"
);
```

### Environment Variables

You can configure the maximum number of proxy IPs by setting:

```bash
VITE_MAX_PROXY_IPS=50
```

---

## Integration Example

### Complete Workflow

1. **Fetch available countries:**
   ```typescript
   const statsResponse = await fetch('https://bestip.06151953.xyz/api/stats');
   const statsData = await statsResponse.json();
   ```

2. **Display countries to user:**
   ```typescript
   // Map cities to countries and aggregate counts
   const countryOptions = processStatsData(statsData.byCity);
   ```

3. **Fetch IPs when user selects a country:**
   ```typescript
   const countryCode = 'JP'; // User selected Japan
   const ipsResponse = await fetch(
     `https://bestip.06151953.xyz/country/${countryCode}`
   );
   const ipsData = await ipsResponse.json();
   ```

4. **Format and use the proxy IPs:**
   ```typescript
   const proxyIps = ipsData
     .slice(0, MAX_PROXY_IPS)
     .map(item => `${item.ip}:${item.port}`)
     .join(',');
   ```

---

## City to Country Mapping

The application uses a utility function `getCityToCountry()` to map city names from the stats API to country codes, names, and flag emojis. This mapping is defined in `src/utils/cityToCountry.ts`.

Example mapping:
```typescript
{
  "NewYork": { code: "US", name: "United States", emoji: "🇺🇸" },
  "Tokyo": { code: "JP", name: "Japan", emoji: "🇯🇵" },
  "London": { code: "GB", name: "United Kingdom", emoji: "🇬🇧" },
  "Frankfurt": { code: "DE", name: "Germany", emoji: "🇩🇪" },
  "Singapore": { code: "SG", name: "Singapore", emoji: "🇸🇬" }
}
```

---

## Best Practices

1. **Shuffle IPs before limiting**: When receiving more IPs than needed, shuffle the array randomly before slicing to ensure variety across requests.

2. **User feedback**: Always provide clear feedback to users when fetching IPs:
   - Show loading state during fetch
   - Display success notification with IP count
   - Show error messages with helpful context

3. **Fallback handling**: Maintain a list of default countries in case the stats API is unavailable.

4. **IP format validation**: Validate the format of returned IPs before using them in your application.

5. **Respect MAX_PROXY_IPS**: Always limit the number of IPs to avoid performance issues and excessive data usage.

---

## Security Considerations

1. **HTTPS Only**: The API uses HTTPS, ensuring encrypted communication.

2. **No Authentication**: The API is publicly accessible and doesn't require authentication. Be mindful of this when deploying to production.

3. **IP Validation**: Always validate IP addresses and ports before using them to prevent injection attacks.

4. **CSP Configuration**: Ensure your Content Security Policy allows connections to `https://bestip.06151953.xyz/`.

---

## Troubleshooting

### Common Issues

**Issue:** "Failed to fetch" error
- **Cause:** Network connectivity issues or CORS restrictions
- **Solution:** Check network connection and verify CORS is properly configured

**Issue:** Empty array returned for country
- **Cause:** No IPs available for the requested country
- **Solution:** Implement fallback to show user-friendly message or suggest alternative countries

**Issue:** Slow response times
- **Cause:** API server load or network latency
- **Solution:** Implement loading indicators and consider caching responses

---

## API Changelog

### Current Version
- `/api/stats` - Returns IP statistics by city
- `/country/{countryCode}` - Returns proxy IPs by country code

*Note: This API documentation reflects the current implementation as of the latest codebase version. Contact the API maintainer for updates or changes.*

---

## Support

For issues related to the BestIP API, please refer to:
- Application repository issues
- API endpoint monitoring
- Network connectivity diagnostics

---

## Related Files

- `src/utils/constants.ts` - API endpoint constants
- `src/utils/cityToCountry.ts` - City to country mapping utility
- `src/components/WorkerForm.tsx` - Single worker deployment with IP fetching
- `src/components/BulkWorkerDeployment.tsx` - Bulk deployment with IP fetching
