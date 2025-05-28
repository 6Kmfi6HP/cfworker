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
    // Create a new request with the same method, headers, and body
    const proxyRequest = new Request(finalUrl, {
      method: request.method,
      headers: request.headers,
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