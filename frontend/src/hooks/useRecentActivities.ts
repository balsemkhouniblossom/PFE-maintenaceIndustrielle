import { useState, useEffect } from 'react';

export interface Activity {
  id: string;
  type: string;
  title?: string;
  description?: string;
  date?: string;
  timestamp?: string;
  status?: string;
  [key: string]: unknown;
}

export function useRecentActivities(limit: number = 5) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock data for now
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActivities([
      { id: '1', type: 'system', title: 'System check completed', description: 'System check completed', timestamp: new Date().toISOString() }
    ]);
  }, [limit]);

  return { activities, loading };
}
