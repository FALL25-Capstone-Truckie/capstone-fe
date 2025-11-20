import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useLogoutListener } from '@/hooks/useLogoutListener';
import { useAuth } from '@/context';
import { ChatProvider } from '@/context/ChatContext';
import { IssuesProvider } from '@/context/IssuesContext';
import ChatWidget from '@/components/chat/ChatWidget';
import StaffChatWidget from '@/components/chat/StaffChatWidget';
import issueWebSocket from '@/services/websocket/issueWebSocket';

/**
 * Root layout component that wraps all routes
 * Handles logout listener which requires Router context
 */
const RootLayout: React.FC = () => {
  // Listen for logout events from httpClient
  useLogoutListener();
  
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';

  // Connect to WebSocket for staff users
  useEffect(() => {
    if (user && user.role === 'staff') {
      issueWebSocket.connect().catch(error => {
        console.error('❌ [RootLayout] Failed to connect to WebSocket:', error);
      });

      return () => {
        issueWebSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <ChatProvider isStaff={isStaff}>
      <IssuesProvider>
        <Outlet />
        {isStaff ? <StaffChatWidget /> : <ChatWidget />}
      </IssuesProvider>
    </ChatProvider>
  );
};

export default RootLayout;
