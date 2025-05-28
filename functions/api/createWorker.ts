// Cloudflare Pages Function for /api/createWorker endpoint
// This function proxies requests to the backend API and adds CORS headers

interface Env {
  // Environment variables for the proxy target
  API_TARGET?: string;
}

export async function onRequest(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request } = context;
  
  // Get the target API endpoint from environment or use default
  const targetAPI = context.env.API_TARGET || 'https://cfworkerback-pages5.pages.dev';
  const targetUrl = `${targetAPI}/createWorker`;
  
  // Get the original request URL to preserve query parameters
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  const finalUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;
  
  try {
    // Get client IP from Cloudflare headers
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     request.headers.get('X-Real-IP') || 
                     'unknown';
    
    // Create headers for the proxy request
    const proxyHeaders = new Headers(request.headers);
    
    // Add/update IP forwarding headers
    proxyHeaders.set('X-Forwarded-For', clientIP);
    proxyHeaders.set('X-Real-IP', clientIP);
    proxyHeaders.set('X-Client-IP', clientIP);
    
    // Preserve original CF headers if they exist
    if (request.headers.get('CF-Connecting-IP')) {
      proxyHeaders.set('CF-Connecting-IP', request.headers.get('CF-Connecting-IP')!);
    }
    if (request.headers.get('CF-Ray')) {
      proxyHeaders.set('CF-Ray', request.headers.get('CF-Ray')!);
    }
    if (request.headers.get('CF-IPCountry')) {
      proxyHeaders.set('CF-IPCountry', request.headers.get('CF-IPCountry')!);
    }
    
    // Create a new request with the same method, updated headers, and body
    const proxyRequest = new Request(finalUrl, {
      method: request.method,
      headers: proxyHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });
    
    // Make the request to the target API
    const response = await fetch(proxyRequest);
    
    // Create a new response with CORS headers
    const proxyResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        // Copy original response headers
        ...Object.fromEntries(response.headers.entries()),
        // Add CORS headers
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Email, X-Auth-Key, X-Account-Context',
        'Access-Control-Max-Age': '86400',
      },
    });
    
    return proxyResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({ 
        error: 'Proxy request failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Email, X-Auth-Key, X-Account-Context',
        },
      }
    );
  }
}

// Handle preflight OPTIONS requests
export async function onRequestOptions(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Email, X-Auth-Key, X-Account-Context',
      'Access-Control-Max-Age': '86400',
    },
  });
} 