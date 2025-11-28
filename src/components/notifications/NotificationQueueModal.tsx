import React, { useState } from 'react';
import { Modal, Badge, Button, List, Typography, Space, Tag, Tooltip, Card, Empty } from 'antd';
import { 
  ExclamationCircleOutlined, 
  WarningOutlined, 
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { Issue } from '@/models/Issue';
import { useIssuesContext } from '@/context';

const { Text, Title } = Typography;

interface QueuedIssue {
  id: string;
  issue: Issue;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  receivedAt: Date;
  showModal: boolean;
}

interface NotificationQueueModalProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationQueueModal: React.FC<NotificationQueueModalProps> = ({ visible, onClose }) => {
  const { 
    queuedIssues, 
    markAsProcessed, 
    removeFromQueue,
    showNewIssueModal,
    getHighPriorityCount 
  } = useIssuesContext();

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      case 'LOW': return 'blue';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'MEDIUM': return <WarningOutlined style={{ color: '#fa8c16' }} />;
      case 'LOW': return <InfoCircleOutlined style={{ color: '#1677ff' }} />;
      default: return <InfoCircleOutlined />;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'Ưu tiên cao';
      case 'MEDIUM': return 'Ưu tiên trung bình';
      case 'LOW': return 'Ưu tiên thấp';
      default: return 'Không xác định';
    }
  };

  const getCategoryText = (issueCategory: string) => {
    switch (issueCategory) {
      case 'ORDER_REJECTION': return 'Từ chối nhận hàng';
      case 'SEAL_REPLACEMENT': return 'Thay thế seal';
      case 'DAMAGE': return 'Hàng hóa hư hỏng';
      case 'REROUTE': return 'Tái định tuyến';
      case 'PENALTY': return 'Phạt vi phạm';
      default: return issueCategory;
    }
  };

  const getCategoryColor = (issueCategory: string) => {
    switch (issueCategory) {
      case 'ORDER_REJECTION': return 'red';
      case 'SEAL_REPLACEMENT': return 'purple';
      case 'DAMAGE': return 'orange';
      case 'REROUTE': return 'cyan';
      case 'PENALTY': return 'volcano';
      default: return 'default';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  const handleViewIssue = (queuedIssue: QueuedIssue) => {
    showNewIssueModal(queuedIssue.issue);
    markAsProcessed(queuedIssue.id);
  };

  const handleRemoveFromQueue = (issueId: string) => {
    removeFromQueue(issueId);
  };

  const handleMarkAsProcessed = (issueId: string) => {
    markAsProcessed(issueId);
  };

  const renderQueuedIssue = (queuedIssue: QueuedIssue) => {
    const { issue, priority, receivedAt } = queuedIssue;
    
    return (
      <List.Item
        key={queuedIssue.id}
        className="queued-issue-item"
        style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: priority === 'HIGH' ? '#fff2f0' : priority === 'MEDIUM' ? '#fff7e6' : '#f6ffed',
          borderRadius: '8px',
          marginBottom: '8px'
        }}
        actions={[
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewIssue(queuedIssue)}
            >
              Xem
            </Button>
          </Tooltip>,
          <Tooltip title="Đánh dấu đã xử lý">
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleMarkAsProcessed(queuedIssue.id)}
            >
              Xử lý
            </Button>
          </Tooltip>,
          <Tooltip title="Xóa khỏi hàng đợi">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveFromQueue(queuedIssue.id)}
            >
              Xóa
            </Button>
          </Tooltip>
        ]}
      >
        <List.Item.Meta
          avatar={getPriorityIcon(priority)}
          title={
            <Space>
              <Tag color={getCategoryColor(issue.issueCategory)}>
                {getCategoryText(issue.issueCategory)}
              </Tag>
              <Tag color={getPriorityColor(priority)}>
                {getPriorityText(priority)}
              </Tag>
              <Text strong>{issue.orderDetail?.orderId || 'N/A'}</Text>
            </Space>
          }
          description={
            <div>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">{issue.description}</Text>
                <Space>
                  <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {formatTimeAgo(receivedAt)}
                  </Text>
                </Space>
                {issue.orderDetail && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Kiện hàng: {issue.orderDetail.trackingCode}
                  </Text>
                )}
              </Space>
            </div>
          }
        />
      </List.Item>
    );
  };

  const highPriorityCount = getHighPriorityCount();
  const totalCount = queuedIssues.length;

  return (
    <Modal
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Hàng đợi thông báo ({totalCount})
          </Title>
          {highPriorityCount > 0 && (
            <Badge count={highPriorityCount} style={{ backgroundColor: '#ff4d4f' }}>
              <Tag color="red">Ưu tiên cao</Tag>
            </Badge>
          )}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button 
          key="process-all" 
          type="primary" 
          onClick={() => {
            queuedIssues.forEach((qi: QueuedIssue) => markAsProcessed(qi.id));
            onClose();
          }}
          disabled={totalCount === 0}
        >
          Đánh dấu tất cả đã xử lý
        </Button>
      ]}
    >
      {queuedIssues.length === 0 ? (
        <Empty
          description="Không có thông báo nào trong hàng đợi"
          style={{ padding: '40px 0' }}
        />
      ) : (
        <List
          dataSource={queuedIssues}
          renderItem={renderQueuedIssue}
          style={{ maxHeight: '400px', overflowY: 'auto' }}
        />
      )}
    </Modal>
  );
};

export default NotificationQueueModal;
