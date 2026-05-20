import { useAuth } from '../contexts/AuthContext';

export const useBackend = () => {
  const { token, logout } = useAuth();

  const request = async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(endpoint, { ...options, headers });
      
      if (response.status === 401) {
        logout();
        throw new Error('Unauthorized');
      }
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  };

  return { request };
};
