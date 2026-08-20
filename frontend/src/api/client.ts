// Base URL of the backend API
const API_BASE = 'http://localhost:5037/api';

// Generic helper for GET requests
export async function apiGet<T>(path: string, token?: string): Promise<T>
{
    const headers: HeadersInit = {};
    if(token) headers['Authorization'] = 'Bearer ${token}';

    const response = await fetch(`${API_BASE}${path}`, {headers});
    if(!response.ok) throw new Error(`Request failed: ${response.status}`);

    return response.json();
}

// Generic helper for POST requests
export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T>
{
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if(token) headers['Authorization'] = 'Bearer ${token}';

    const response = await fetch(`${API_BASE}${path}`, 
        {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        }
    );
    if(!response.ok) throw new Error(`Request failed: ${response.status}`);

    return response.json();
}