export const API_URL = 'http://localhost:3000/api';

export const api = {
    get: async (url: string) => {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}${url}`, { headers });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            throw new Error('API Error');
        }
        return response.json();
    },
    post: async (url: string, body: any) => {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error: any = new Error(errorData.message || 'API Error');
            error.response = { data: errorData };
            throw error;
        }
        return response.json();
    },
    put: async (url: string, body: any) => {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },
    patch: async (url: string, body: any) => {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}${url}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },
    delete: async (url: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}${url}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Request failed');
        }
        if (response.status === 204) {
            return null;
        }
        return response.json();
    },
};
