import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/features/auth/AuthProvider';
import { LoadingState } from '@/components/shared';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) return <LoadingState message="Checking permissions..." />;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;
