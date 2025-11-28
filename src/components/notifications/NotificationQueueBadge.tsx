import React from 'react';
import { Badge, Button, Tooltip, Dropdown, Space } from 'antd';
import { 
  BellOutlined, 
  ExclamationCircleOutlined,
  FireOutlined 
} from '@ant-design/icons';
import { useIssuesContext } from '@/context';
import NotificationQueueModal from './NotificationQueueModal';

const NotificationQueueBadge: React.FC = () => {
  const { 
    queuedIssues, 
    isQueueOpen, 
    toggleQueue, 
    getQueueCount, 
    getHighPriorityCount 
  } = useIssuesContext();

  console.log('🔍 DEBUG: NotificationQueueBadge rendering');
  console.log('🔍 DEBUG: queuedIssues count:', queuedIssues.length);

  const totalCount = getQueueCount();
  const highPriorityCount = getHighPriorityCount();

  console.log('🔍 DEBUG: totalCount:', totalCount, 'highPriorityCount:', highPriorityCount);

  // TEMP: Always show badge for staff users to verify integration
  // Don't show badge if no issues in queue
  if (totalCount === 0) {
    return (
      <Tooltip title="Hàng đợi sự cố trống" placement="bottom">
        <Button
          type="text"
          icon={<BellOutlined />}
          onClick={toggleQueue}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '40px',
            width: '40px',
            borderRadius: '8px',
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
          }}
        />
      </Tooltip>
    );
  }

  const getBadgeStatus = () => {
    if (highPriorityCount > 0) return 'error';
    return 'processing';
  };

  const getBadgeIcon = () => {
    if (highPriorityCount > 0) return <FireOutlined style={{ color: '#ff4d4f' }} />;
    return <BellOutlined />;
  };

  const getTooltipText = () => {
    if (highPriorityCount > 0) {
      return `${highPriorityCount} sự cố ưu tiên cao, ${totalCount - highPriorityCount} sự cố khác`;
    }
    return `${totalCount} sự cố đang chờ xử lý`;
  };

  return (
    <>
      <Tooltip title={getTooltipText()} placement="bottom">
        <Badge 
          count={totalCount} 
          status={getBadgeStatus()}
          style={{ cursor: 'pointer' }}
        >
          <Button
            type="text"
            icon={getBadgeIcon()}
            onClick={toggleQueue}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40px',
              width: '40px',
              borderRadius: '8px',
              backgroundColor: highPriorityCount > 0 ? '#fff2f0' : '#f6ffed',
              border: highPriorityCount > 0 ? '1px solid #ffccc7' : '1px solid #b7eb8f',
            }}
          />
        </Badge>
      </Tooltip>

      <NotificationQueueModal
        visible={isQueueOpen}
        onClose={toggleQueue}
      />
    </>
  );
};

export default NotificationQueueBadge;
