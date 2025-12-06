import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  Table, 
  Typography, 
  Tag, 
  Input, 
  Space, 
  Button, 
  Tooltip,
  Row,
  Col,
  Statistic,
  Select,
  Skeleton,
  Empty,
  Modal,
  Descriptions,
  Image
} from 'antd';
import { 
  RollbackOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import issueService from '../../../services/issue/issueService';

const { Title, Text } = Typography;

interface RefundItem {
  id: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
  processedAt?: string;
  issue?: {
    id: string;
    issueCode: string;
    issueType: string;
    description: string;
    issueImages?: { imageUrl: string }[];
  };
  orderDetail?: {
    id: string;
    order?: {
      orderCode: string;
    };
  };
}

const RefundListPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRefund, setSelectedRefund] = useState<RefundItem | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  const { data: issues = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['staffIssues'],
    queryFn: () => issueService.getAllIssues(),
  });

  // Extract refunds from issues (issues that have damageCompensation)
  const refunds: RefundItem[] = issues
    .filter((issue: any) => issue.damageCompensation)
    .map((issue: any) => ({
      id: issue.damageCompensation.id || issue.id,
      amount: issue.damageCompensation.amount || 0,
      reason: issue.damageCompensation.reason || issue.description,
      status: issue.damageCompensation.status || 'PENDING',
      createdAt: issue.damageCompensation.createdAt || issue.createdAt,
      processedAt: issue.damageCompensation.processedAt,
      issue: {
        id: issue.id,
        issueCode: issue.issueCode,
        issueType: issue.issueType,
        description: issue.description,
        issueImages: issue.issueImages,
      },
      orderDetail: issue.orderDetail,
    }));

  // Filter refunds
  const filteredRefunds = refunds.filter(r => {
    const matchSearch = searchText === '' || 
      r.issue?.issueCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.orderDetail?.order?.orderCode?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Stats
  const stats = {
    total: refunds.length,
    completed: refunds.filter(r => r.status === 'COMPLETED' || r.status === 'PAID').length,
    pending: refunds.filter(r => r.status === 'PENDING').length,
    totalAmount: refunds.reduce((sum, r) => sum + (r.amount || 0), 0),
  };

  const getStatusTag = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'PAID':
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã hoàn tiền</Tag>;
      case 'PENDING':
        return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ xử lý</Tag>;
      case 'REJECTED':
        return <Tag icon={<CloseCircleOutlined />} color="error">Từ chối</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const handleViewDetail = (refund: RefundItem) => {
    setSelectedRefund(refund);
    setIsDetailVisible(true);
  };

  const columns: ColumnsType<RefundItem> = [
    {
      title: 'Mã sự cố',
      key: 'issueCode',
      width: 140,
      render: (_, record) => (
        <Text strong className="text-blue-600">{record.issue?.issueCode || '-'}</Text>
      )
    },
    {
      title: 'Mã đơn hàng',
      key: 'orderCode',
      width: 140,
      render: (_, record) => (
        <Text>{record.orderDetail?.order?.orderCode || '-'}</Text>
      )
    },
    {
      title: 'Loại sự cố',
      key: 'issueType',
      width: 150,
      render: (_, record) => {
        const type = record.issue?.issueType;
        switch (type?.toUpperCase()) {
          case 'DAMAGED': return <Tag color="red">Hư hỏng</Tag>;
          case 'LOST': return <Tag color="orange">Mất hàng</Tag>;
          case 'DELAY': return <Tag color="blue">Trễ hẹn</Tag>;
          default: return <Tag>{type}</Tag>;
        }
      }
    },
    {
      title: 'Số tiền hoàn',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        <Text strong className="text-green-600">
          {amount?.toLocaleString('vi-VN')} đ
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button 
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          />
        </Tooltip>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Title level={3} className="mb-2">
          <RollbackOutlined className="mr-2 text-blue-600" />
          Quản lý hoàn tiền
        </Title>
        <Text type="secondary">Theo dõi và xử lý các yêu cầu hoàn tiền từ sự cố</Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card className="text-center shadow-sm border-t-4 border-t-blue-500">
            <Statistic title="Tổng yêu cầu" value={stats.total} prefix={<RollbackOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center shadow-sm border-t-4 border-t-green-500">
            <Statistic title="Đã hoàn" value={stats.completed} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center shadow-sm border-t-4 border-t-yellow-500">
            <Statistic title="Chờ xử lý" value={stats.pending} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center shadow-sm border-t-4 border-t-purple-500">
            <Statistic 
              title="Tổng tiền hoàn" 
              value={stats.totalAmount}
              formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Space wrap className="w-full justify-between">
          <Space wrap>
            <Input
              placeholder="Tìm theo mã sự cố, đơn hàng..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'COMPLETED', label: 'Đã hoàn' },
                { value: 'PENDING', label: 'Chờ xử lý' },
                { value: 'REJECTED', label: 'Từ chối' },
              ]}
            />
          </Space>
          <Button 
            icon={<ReloadOutlined spin={isFetching} />} 
            onClick={() => refetch()}
          >
            Làm mới
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredRefunds}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} yêu cầu hoàn tiền`
          }}
          locale={{ emptyText: <Empty description="Không có yêu cầu hoàn tiền nào" /> }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined className="text-blue-600" />
            Chi tiết hoàn tiền
          </Space>
        }
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedRefund && (
          <div className="space-y-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Mã sự cố" span={1}>
                {selectedRefund.issue?.issueCode}
              </Descriptions.Item>
              <Descriptions.Item label="Mã đơn hàng" span={1}>
                {selectedRefund.orderDetail?.order?.orderCode || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Loại sự cố" span={1}>
                {selectedRefund.issue?.issueType}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                {getStatusTag(selectedRefund.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền hoàn" span={1}>
                <Text strong className="text-green-600">
                  {selectedRefund.amount?.toLocaleString('vi-VN')} đ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                {dayjs(selectedRefund.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do" span={2}>
                {selectedRefund.reason || selectedRefund.issue?.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            {selectedRefund.issue?.issueImages && selectedRefund.issue.issueImages.length > 0 && (
              <Card title="Hình ảnh sự cố" size="small">
                <Image.PreviewGroup>
                  <Space wrap>
                    {selectedRefund.issue.issueImages.map((img, index) => (
                      <Image
                        key={index}
                        width={100}
                        height={100}
                        src={img.imageUrl}
                        style={{ objectFit: 'cover' }}
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RefundListPage;
