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
  Progress
} from 'antd';
import { 
  FileTextOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import contractService from '../../../services/contract/contractService';

const { Title, Text } = Typography;

interface Contract {
  id: string;
  contractCode: string;
  totalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  signedAt?: string;
  order?: {
    id: string;
    orderCode: string;
    status: string;
  };
  transactions?: any[];
}

const ContractListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const { data: contracts = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['staffContracts'],
    queryFn: () => contractService.getAllContracts(),
  });

  // Filter contracts
  const filteredContracts = contracts.filter((c: Contract) => {
    const matchSearch = searchText === '' || 
      c.contractCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      c.order?.orderCode?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchPayment = paymentFilter === 'all' || c.paymentStatus === paymentFilter;

    return matchSearch && matchStatus && matchPayment;
  });

  // Stats
  const stats = {
    total: contracts.length,
    active: contracts.filter((c: Contract) => c.status === 'ACTIVE' || c.status === 'SIGNED').length,
    pending: contracts.filter((c: Contract) => c.status === 'PENDING' || c.status === 'DRAFT').length,
    completed: contracts.filter((c: Contract) => c.status === 'COMPLETED').length,
    totalValue: contracts.reduce((sum: number, c: Contract) => sum + (c.totalPrice || 0), 0),
  };

  const getStatusTag = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SIGNED':
      case 'ACTIVE':
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã ký</Tag>;
      case 'PENDING':
      case 'DRAFT':
        return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ ký</Tag>;
      case 'COMPLETED':
        return <Tag icon={<CheckCircleOutlined />} color="blue">Hoàn thành</Tag>;
      case 'CANCELLED':
        return <Tag icon={<CloseCircleOutlined />} color="error">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getPaymentStatusTag = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'FULL_PAID':
        return <Tag color="success">Đã thanh toán đủ</Tag>;
      case 'DEPOSIT_PAID':
        return <Tag color="blue">Đã đặt cọc</Tag>;
      case 'PENDING':
        return <Tag color="warning">Chưa thanh toán</Tag>;
      case 'PARTIAL':
        return <Tag color="orange">Thanh toán một phần</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<Contract> = [
    {
      title: 'Mã hợp đồng',
      dataIndex: 'contractCode',
      key: 'contractCode',
      width: 150,
      render: (code: string, record) => (
        <Button 
          type="link" 
          className="p-0 font-semibold"
          onClick={() => navigate(`/staff/contracts/${record.id}`)}
        >
          {code}
        </Button>
      )
    },
    {
      title: 'Mã đơn hàng',
      key: 'orderCode',
      width: 140,
      render: (_, record) => (
        <Text>{record.order?.orderCode || '-'}</Text>
      )
    },
    {
      title: 'Tổng giá trị',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 150,
      align: 'right',
      render: (price: number) => (
        <Text strong className="text-green-600">
          {price?.toLocaleString('vi-VN')} đ
        </Text>
      )
    },
    {
      title: 'Tiến độ thanh toán',
      key: 'paymentProgress',
      width: 180,
      render: (_, record) => {
        const paid = (record.totalPrice || 0) - (record.remainingAmount || 0);
        const percent = record.totalPrice > 0 ? Math.round((paid / record.totalPrice) * 100) : 0;
        return (
          <div>
            <Progress 
              percent={percent} 
              size="small" 
              status={percent === 100 ? 'success' : 'active'}
              format={() => `${percent}%`}
            />
            <Text type="secondary" className="text-xs">
              {paid.toLocaleString('vi-VN')} / {record.totalPrice?.toLocaleString('vi-VN')} đ
            </Text>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 150,
      render: (status: string) => getPaymentStatusTag(status)
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
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button 
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/staff/contracts/${record.id}`)}
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
          <FileTextOutlined className="mr-2 text-blue-600" />
          Quản lý hợp đồng
        </Title>
        <Text type="secondary">Theo dõi và quản lý các hợp đồng vận chuyển</Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card className="text-center shadow-sm border-t-4 border-t-blue-500">
            <Statistic title="Tổng hợp đồng" value={stats.total} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center shadow-sm border-t-4 border-t-green-500">
            <Statistic title="Đang hoạt động" value={stats.active} valueStyle={{ color: '#52c41a' }} />
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
              title="Tổng giá trị" 
              value={stats.totalValue} 
              prefix={<DollarOutlined />}
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
              placeholder="Tìm theo mã hợp đồng, đơn hàng..."
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
                { value: 'SIGNED', label: 'Đã ký' },
                { value: 'PENDING', label: 'Chờ ký' },
                { value: 'COMPLETED', label: 'Hoàn thành' },
                { value: 'CANCELLED', label: 'Đã hủy' },
              ]}
            />
            <Select
              value={paymentFilter}
              onChange={setPaymentFilter}
              style={{ width: 180 }}
              options={[
                { value: 'all', label: 'Tất cả thanh toán' },
                { value: 'PAID', label: 'Đã thanh toán đủ' },
                { value: 'DEPOSIT_PAID', label: 'Đã đặt cọc' },
                { value: 'PENDING', label: 'Chưa thanh toán' },
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
          dataSource={filteredContracts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hợp đồng`
          }}
          locale={{ emptyText: <Empty description="Không có hợp đồng nào" /> }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default ContractListPage;
