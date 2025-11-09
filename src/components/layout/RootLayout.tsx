import React from 'react';
import { Outlet } from 'react-router-dom';
import { useLogoutListener } from '@/hooks/useLogoutListener';

/**
 * Root layout component that wraps all routes
 * Handles logout listener which requires Router context
 */
const RootLayout: React.FC = () => {
  // Listen for logout events from httpClient
  useLogoutListener();

  return <Outlet />;
};

export default RootLayout;
