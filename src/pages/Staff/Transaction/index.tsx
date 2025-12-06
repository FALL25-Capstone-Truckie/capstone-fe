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
  DatePicker,
  Select,
  Skeleton,
  Empty
} from 'antd';
import { 
  DollarOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import contractService from '../../../services/contract/contractService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Transaction {
  id: string;
  transactionCode: string;
  amount: number;
  status: string;
  type: string;
  paymentMethod: string;
  createdAt: string;
  contractId: string;
  orderCode?: string;
}

interface Contract {
  id: string;
  contractCode: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  order?: {
    id: string;
    orderCode: string;
  };
  transactions?: Transaction[];
}

const TransactionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const { data: contracts = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['staffContracts'],
    queryFn: () => contractService.getAllContracts(),
  });

  // Extract all transactions from contracts
  const allTransactions: (Transaction & { contract: Contract })[] = contracts.flatMap((contract: Contract) => 
    (contract.transactions || []).map((t: Transaction) => ({
      ...t,
      contract
    }))
  );

  // Filter transactions
  const filteredTransactions = allTransactions.filter(t => {
    const matchSearch = searchText === '' || 
      t.transactionCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      t.contract.contractCode?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    
    const matchDate = !dateRange || !dateRange[0] || !dateRange[1] ||
      (dayjs(t.createdAt).isAfter(dateRange[0]) && dayjs(t.createdAt).isBefore(dateRange[1]));

    return matchSearch && matchStatus && matchDate;
  });

  // Stats
  const stats = {
    total: allTransactions.length,
    completed: allTransactions.filter(t => t.status === 'PAID' || t.status === 'COMPLETED').length,
    pending: allTransactions.filter(t => t.status === 'PENDING').length,
    failed: allTransactions.filter(t => t.status === 'FAILED' || t.status === 'CANCELLED').length,
  };

  const getStatusTag = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
        return <Tag icon={<CheckCircleOutlined />} color="success">Thành công</Tag>;
      case 'PENDING':
        return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ xử lý</Tag>;
      case 'FAILED':
      case 'CANCELLED':
        return <Tag icon={<CloseCircleOutlined />} color="error">Thất bại</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getTypeTag = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT':
        return <Tag color="blue">Đặt cọc</Tag>;
      case 'FULL_PAYMENT':
        return <Tag color="green">Thanh toán đủ</Tag>;
      case 'RETURN_SHIPPING':
        return <Tag color="orange">Hoàn tiền</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const columns: ColumnsType<Transaction & { contract: Contract }> = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      width: 150,
      render: (code: string) => <Text strong className="text-blue-600">{code || '-'}</Text>
    },
    {
      title: 'Mã hợp đồng',
      key: 'contractCode',
      width: 150,
      render: (_, record) => (
        <Text>{record.contract.contractCode || '-'}</Text>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => getTypeTag(type)
    },
    {
      title: 'Số tiền',
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
      width: 160,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết hợp đồng">
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => navigate(`/staff/contracts/${record.contract.id}`)}
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
          <DollarOutlined className="mr-2 text-blue-600" />
          Quản lý giao dịch
        </Title>
        <Text type="secondary">Theo dõi và quản lý các giao dịch thanh toán</Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card className="text-center shadow-sm border-t-4 border-t-blue-500">
            <Statistic title="Tổng giao dịch" value={stats.total} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center shadow-sm border-t-4 border-t-green-500">
            <Statistic title="Thành công" value={stats.completed} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center shadow-sm border-t-4 border-t-yellow-500">
            <Statistic title="Chờ xử lý" value={stats.pending} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center shadow-sm border-t-4 border-t-red-500">
            <Statistic title="Thất bại" value={stats.failed} valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Space wrap className="w-full justify-between">
          <Space wrap>
            <Input
              placeholder="Tìm theo mã giao dịch, hợp đồng..."
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
                { value: 'PAID', label: 'Thành công' },
                { value: 'PENDING', label: 'Chờ xử lý' },
                { value: 'FAILED', label: 'Thất bại' },
              ]}
            />
            <RangePicker
              onChange={(dates) => setDateRange(dates)}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
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
          dataSource={filteredTransactions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} giao dịch`
          }}
          locale={{ emptyText: <Empty description="Không có giao dịch nào" /> }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default TransactionListPage;
