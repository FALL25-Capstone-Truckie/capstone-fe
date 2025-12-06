import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  Typography, 
  Tag, 
  Button, 
  Descriptions,
  Tabs,
  Table,
  Timeline,
  Row,
  Col,
  Statistic,
  Skeleton,
  Empty,
  Divider,
  Progress,
  Space
} from 'antd';
import { 
  FileTextOutlined, 
  ArrowLeftOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
  UserOutlined,
  CalendarOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import contractService from '../../../services/contract/contractService';

const { Title, Text, Paragraph } = Typography;

interface Transaction {
  id: string;
  transactionCode: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
}

const ContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: contract, isLoading, isError } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractService.getContractById(id!),
    enabled: !!id,
  });

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
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const transactionColumns: ColumnsType<Transaction> = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      render: (code: string) => <Text strong className="text-blue-600">{code}</Text>
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        switch (type?.toUpperCase()) {
          case 'DEPOSIT': return <Tag color="blue">Đặt cọc</Tag>;
          case 'FULL_PAYMENT': return <Tag color="green">Thanh toán đủ</Tag>;
          case 'RETURN_SHIPPING': return <Tag color="orange">Hoàn tiền</Tag>;
          default: return <Tag>{type}</Tag>;
        }
      }
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
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
      render: (status: string) => {
        switch (status?.toUpperCase()) {
          case 'PAID':
          case 'COMPLETED':
            return <Tag color="success">Thành công</Tag>;
          case 'PENDING':
            return <Tag color="warning">Chờ xử lý</Tag>;
          case 'FAILED':
            return <Tag color="error">Thất bại</Tag>;
          default:
            return <Tag>{status}</Tag>;
        }
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 15 }} />
      </div>
    );
  }

  if (isError || !contract) {
    return (
      <div className="p-6">
        <Empty description="Không tìm thấy hợp đồng" />
        <div className="text-center mt-4">
          <Button onClick={() => navigate('/staff/contracts')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const paidAmount = (contract.totalPrice || 0) - (contract.remainingAmount || 0);
  const paymentPercent = contract.totalPrice > 0 
    ? Math.round((paidAmount / contract.totalPrice) * 100) 
    : 0;

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <FileTextOutlined />
          Tổng quan
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Contract Info */}
          <Card title="Thông tin hợp đồng" className="shadow-sm">
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
              <Descriptions.Item label="Mã hợp đồng">
                <Text strong>{contract.contractCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(contract.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                {getPaymentStatusTag(contract.paymentStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(contract.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày ký">
                {contract.signedAt ? dayjs(contract.signedAt).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Mã đơn hàng">
                <Button 
                  type="link" 
                  className="p-0"
                  onClick={() => navigate(`/staff/orders/${contract.order?.id}`)}
                >
                  {contract.order?.orderCode || '-'}
                </Button>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Payment Summary */}
          <Card title="Tình hình thanh toán" className="shadow-sm">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Statistic
                  title="Tổng giá trị hợp đồng"
                  value={contract.totalPrice || 0}
                  prefix={<DollarOutlined />}
                  formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`}
                />
              </Col>
              <Col xs={24} md={8}>
                <Statistic
                  title="Đã thanh toán"
                  value={paidAmount}
                  valueStyle={{ color: '#52c41a' }}
                  formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`}
                />
              </Col>
              <Col xs={24} md={8}>
                <Statistic
                  title="Còn lại"
                  value={contract.remainingAmount || 0}
                  valueStyle={{ color: contract.remainingAmount > 0 ? '#faad14' : '#52c41a' }}
                  formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`}
                />
              </Col>
            </Row>
            <Divider />
            <div>
              <Text className="mb-2 block">Tiến độ thanh toán</Text>
              <Progress 
                percent={paymentPercent} 
                status={paymentPercent === 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          </Card>

          {/* Contract File */}
          {contract.contractFileUrl && (
            <Card title="Tệp hợp đồng" className="shadow-sm">
              <Space>
                <FilePdfOutlined className="text-2xl text-red-500" />
                <Button 
                  type="primary" 
                  href={contract.contractFileUrl} 
                  target="_blank"
                >
                  Xem hợp đồng PDF
                </Button>
              </Space>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'transactions',
      label: (
        <span>
          <DollarOutlined />
          Giao dịch ({contract.transactions?.length || 0})
        </span>
      ),
      children: (
        <Card className="shadow-sm">
          <Table
            columns={transactionColumns}
            dataSource={contract.transactions || []}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: <Empty description="Chưa có giao dịch nào" /> }}
          />
        </Card>
      ),
    },
    {
      key: 'timeline',
      label: (
        <span>
          <CalendarOutlined />
          Lịch sử
        </span>
      ),
      children: (
        <Card className="shadow-sm">
          <Timeline
            items={[
              {
                color: 'green',
                children: (
                  <>
                    <Text strong>Tạo hợp đồng</Text>
                    <br />
                    <Text type="secondary">{dayjs(contract.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                  </>
                ),
              },
              ...(contract.signedAt ? [{
                color: 'blue',
                children: (
                  <>
                    <Text strong>Ký hợp đồng</Text>
                    <br />
                    <Text type="secondary">{dayjs(contract.signedAt).format('DD/MM/YYYY HH:mm')}</Text>
                  </>
                ),
              }] : []),
              ...(contract.transactions || []).map((t: Transaction) => ({
                color: t.status === 'PAID' ? 'green' : t.status === 'PENDING' ? 'gray' : 'red',
                children: (
                  <>
                    <Text strong>
                      {t.type === 'DEPOSIT' ? 'Đặt cọc' : 
                       t.type === 'FULL_PAYMENT' ? 'Thanh toán đủ' : t.type}
                    </Text>
                    <Text> - {t.amount?.toLocaleString('vi-VN')} đ</Text>
                    <br />
                    <Text type="secondary">{dayjs(t.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                  </>
                ),
              })),
            ]}
          />
        </Card>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/staff/contracts')}
          >
            Quay lại
          </Button>
          <div>
            <Title level={3} className="mb-0">
              <FileTextOutlined className="mr-2 text-blue-600" />
              Hợp đồng {contract.contractCode}
            </Title>
            <Space className="mt-1">
              {getStatusTag(contract.status)}
              {getPaymentStatusTag(contract.paymentStatus)}
            </Space>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultActiveKey="overview" items={tabItems} />
    </div>
  );
};

export default ContractDetailPage;
