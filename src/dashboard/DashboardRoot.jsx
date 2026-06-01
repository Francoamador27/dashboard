import { QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import queryClient from './lib/queryClient';

// Wrapper que provee React Query solo al módulo dashboard
export default function DashboardRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
