/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

interface DashboardStatistics {
  currentMonthWorkOrders: number;
  lastMonthWorkOrders: number;
  percentageChange: number;
  pendingMaintenance: number;
  totalWorkOrders: number;
  // Additional stats for dashboard cards
  activeUsers: number;
  totalMachines: number;
  activeWorkOrders: number;
  completedThisMonth: number;
  // Percentage changes
  usersPercentageChange: number;
  machinesPercentageChange: number;
  workOrdersPercentageChange: number;
  completedPercentageChange: number;
}

export function useDashboardStatistics() {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [workOrderStats, dashboardData] = await Promise.all([
          apiService.getWorkOrderStatistics(),
          apiService.getDashboardData()
        ]);

        const data = dashboardData;

        // Calculate current month vs last month for various metrics
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

        // Active users (current active users vs last month active users)
        const currentActiveUsers = data.users.filter((user: any) => user.is_active).length;
        const lastMonthActiveUsers = data.users.filter((user: any) => {
          if (!user.is_active) return false;
          const createdDate = new Date(user.created_at);
          return createdDate < currentMonth && createdDate >= lastMonth;
        }).length;

        // Total machines (current vs last month)
        const currentMachines = data.machines.length;
        const lastMonthMachines = data.machines.filter((machine: any) => {
          const createdDate = new Date(machine.created_at || Date.now());
          return createdDate < currentMonth && createdDate >= lastMonth;
        }).length;

        // Active work orders (current vs last month)
        const currentActiveWorkOrders = data.workOrders.filter((wo: any) => wo.status !== 'completed').length;
        const lastMonthActiveWorkOrders = data.workOrders.filter((wo: any) => {
          if (wo.status === 'completed') return false;
          const createdDate = new Date(wo.date_created);
          return createdDate < currentMonth && createdDate >= lastMonth;
        }).length;

        // Completed this month
        const completedThisMonth = data.workOrders.filter((wo: any) => {
          if (wo.status !== 'completed') return false;
          const completedDate = new Date(wo.date_end || wo.date_closed || wo.date_created);
          return completedDate >= currentMonth;
        }).length;

        // Calculate percentage changes
        const usersPercentageChange = lastMonthActiveUsers > 0 ? ((currentActiveUsers - lastMonthActiveUsers) / lastMonthActiveUsers) * 100 : 0;
        const machinesPercentageChange = lastMonthMachines > 0 ? ((currentMachines - lastMonthMachines) / lastMonthMachines) * 100 : 0;
        const workOrdersPercentageChange = lastMonthActiveWorkOrders > 0 ? ((currentActiveWorkOrders - lastMonthActiveWorkOrders) / lastMonthActiveWorkOrders) * 100 : 0;

        setStatistics({
          ...workOrderStats.data,
          activeUsers: currentActiveUsers,
          totalMachines: currentMachines,
          activeWorkOrders: currentActiveWorkOrders,
          completedThisMonth: completedThisMonth,
          usersPercentageChange: Math.round(usersPercentageChange * 100) / 100,
          machinesPercentageChange: Math.round(machinesPercentageChange * 100) / 100,
          workOrdersPercentageChange: Math.round(workOrdersPercentageChange * 100) / 100,
          completedPercentageChange: workOrderStats.data.percentageChange // Reuse from work order stats
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Failed to load statistics');
        // Set default values if API fails
        setStatistics({
          currentMonthWorkOrders: 0,
          lastMonthWorkOrders: 0,
          percentageChange: 0,
          pendingMaintenance: 0,
          totalWorkOrders: 0,
          activeUsers: 0,
          totalMachines: 0,
          activeWorkOrders: 0,
          completedThisMonth: 0,
          usersPercentageChange: 0,
          machinesPercentageChange: 0,
          workOrdersPercentageChange: 0,
          completedPercentageChange: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return { statistics, loading, error };
}