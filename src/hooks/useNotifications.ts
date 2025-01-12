import { useState, useEffect, useRef } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';

interface Notification {
  id: number;
  sender: number;
  receiver: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export const useNotifications = () => {
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const {authFetch} = useAuthenticatedFetch()
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) return;

    const ws = new WebSocket(`ws://45.9.191.191/ws/notifications/?token=${accessToken}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'authenticate',
        token: accessToken
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message !== undefined) {
        setNotificationCount(Number(data.message));
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchNotifications = async (resetList = true) => {
    try {
      setIsLoading(true);
      const response = await authFetch(`notifications/?page=${page}&page_size=10`,);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      
      if (resetList) {
        setNotifications(data);
        setPage(1);
      } else {
        setNotifications(prev => [...prev, ...data.results]);
        setPage(page + 1);
      }
      
      setHasMore(!!data.next);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchNotifications(false);
    }
  };

  return { 
    notifications, 
    notificationCount, 
    isLoading, 
    fetchNotifications, 
    loadMore,
    hasMore 
  };
}; 