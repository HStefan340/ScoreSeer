// Backend API base URL, read from .env.development or .env.production
const API_BASE = import.meta.env.VITE_API_URL;

// Called when API rejects a request that carried a token (expired or invalid session)
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null)
{
    onUnauthorized = handler
}

// Shared response check for all helpers
function checkResponse(response: Response, token?: string)
{
    // 401 with a token means the session is no longer valid
    // Without a token (for example a failed login) it is a normal error
    if(response.status === 401 && token && onUnauthorized) onUnauthorized();

    if(!response.ok) throw new Error(`Request failed: ${response.status}`);
}

// Generic helper for GET requests
export async function apiGet<T>(path: string, token?: string): Promise<T>
{
    const headers: HeadersInit = {};
    if(token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${path}`, {headers});
    checkResponse(response, token);

    return response.json();
}

// Generic helper for POST requests
export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T>
{
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if(token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${path}`, 
        {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        }
    );
    checkResponse(response, token);

    return response.json();
}

// Generic helper for DELETE requests
export async function apiDelete(path: string, token?: string): Promise<void>
{
    const headers: HeadersInit = {};

    if(token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${path}`,
    {
        method: 'DELETE',
        headers,
    });

    checkResponse(response, token);
}