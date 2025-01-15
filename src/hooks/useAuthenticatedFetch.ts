import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export const useAuthenticatedFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const refreshAccessToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh');
      const response = await fetch('https://serinek.com/api/v1/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        return await response.json();
      }

      const data = await response.json();
      localStorage.setItem('access', data.access);
      return data.access;
    } catch (error) {
      // If refresh fails, redirect to login
      localStorage.clear();
      navigate('/');
      throw error;
    }
  };

  const authFetch = useCallback(async (url: string, options: FetchOptions = {}) => {
    setIsLoading(true);
    try {
      let accessToken = localStorage.getItem('access');

      const headers = options.body instanceof FormData
      ? { // Don't set Content-Type for FormData
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
      }
      : {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
      };

      // First attempt with current access token
      const response = await fetch(`https://serinek.com/api/v1/${url}`, {
        ...options,
        headers: {
          ...headers,
          },
      });

      // If unauthorized, try refreshing token and retry request
      if (response.status === 401) {
        accessToken = await refreshAccessToken();
        console.log('need refresh')
        const retryResponse = await fetch(`https://serinek.com/api/v1/${url}`, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        return retryResponse;
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  return { authFetch, isLoading };
}; 