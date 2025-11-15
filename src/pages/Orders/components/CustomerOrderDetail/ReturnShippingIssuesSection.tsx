import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, Spin, Alert, Badge, Statistic, Row, Col, Descriptions } from 'antd';
import { 
  ExclamationCircleOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InboxOutlined
} from '@ant-design/icons';
import customerIssueService, { type ReturnShippingIssue } from '@/services/issue/customerIssueService';
import dayjs from 'dayjs';
import { TransactionStatusTag, IssueStatusTag } from '@/components/common/tags';
import { TransactionEnum, IssueEnum } from '@/constants/enums';
import { App } from 'antd';

interface ReturnShippingIssuesSectionProps {
  orderId: string;
  issues?: any[]; // Issues from vehicleAssignments
  onIssuesLoaded?: (count: number) => void;
  isInTab?: boolean; // Whether component is rendered in a tab or standalone
}

/**
 * Section to display return shipping issues for an order
 * Shows pending payments and allows customer to pay or reject
 */
const ReturnShippingIssuesSection: React.FC<ReturnShippingIssuesSectionProps> = ({
  orderId,
  issues: issuesFromProps,
  onIssuesLoaded,
  isInTab = false
}) => {
  const [mappedIssues, setMappedIssues] = useState<ReturnShippingIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const { message } = App.useApp();

  // Map issues from new format to ReturnShippingIssue format
  const mapToReturnShippingIssue = (issue: any): ReturnShippingIssue | null => {
    if (issue.issueCategory !== 'ORDER_REJECTION') return null;

    return {
      issueId: issue.id,
      issueCode: issue.id, // Use id as code if no code available
      description: issue.description || '',
      status: issue.status || 'IN_PROGRESS',
      reportedAt: new Date().toISOString(), // Use current time if not available
      finalFee: issue.finalFee || 0,
      paymentDeadline: issue.paymentDeadline,
      affectedOrderDetails: issue.affectedOrderDetails || [],
      returnTransaction: issue.transaction ? {
        id: issue.transaction.id,
        status: issue.transaction.status,
        amount: issue.transaction.amount,
        currencyCode: issue.transaction.currencyCode || 'VND',
        paymentProvider: issue.transaction.paymentProvider || 'PayOS',
        paymentDate: issue.transaction.paymentDate
      } : issue.refund ? {
        id: issue.refund.id,
        status: 'PAID',
        amount: issue.refund.refundAmount,
        currencyCode: 'VND',
        paymentProvider: 'Refund',
        paymentDate: issue.refund.refundDate
      } : undefined
    };
  };

  // Process issues from props
  useEffect(() => {
    setLoading(true);
    try {
      if (issuesFromProps && issuesFromProps.length > 0) {
        const mapped = issuesFromProps
          .map(mapToReturnShippingIssue)
          .filter((issue): issue is ReturnShippingIssue => issue !== null);
        setMappedIssues(mapped);
        if (onIssuesLoaded) {
          onIssuesLoaded(mapped.length);
        }
      } else {
        setMappedIssues([]);
        if (onIssuesLoaded) {
          onIssuesLoaded(0);
        }
      }
    } catch (error) {
      console.error('Error mapping issues:', error);
      setMappedIssues([]);
    } finally {
      setLoading(false);
    }
  }, [issuesFromProps, onIssuesLoaded]);

  // Fetch issues from API if not provided via props (fallback)
  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await customerIssueService.getReturnShippingIssuesByOrder(orderId);
      setMappedIssues(data);
      if (onIssuesLoaded) {
        onIssuesLoaded(data.length);
      }
    } catch (error) {
      console.error('Error fetching return shipping issues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string, transactionStatus?: string) => {
    if (transactionStatus) {
      return <TransactionStatusTag status={transactionStatus as TransactionEnum} />;
    }
    return <IssueStatusTag status={status as IssueEnum} />;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format deadline date time
  const formatDeadline = (deadline: string) => {
    return dayjs(deadline).format('HH:mm:ss dddd, DD/MM/YYYY');
  };

  // Check if deadline is passed
  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return dayjs(deadline).isBefore(dayjs());
  };

  // Handle payment - redirect to PayOS directly
  const handlePaymentClick = async (issue: ReturnShippingIssue) => {
    if (!issue.finalFee) {
      message.error('Không tìm thấy thông tin thanh toán');
      return;
    }

    setProcessingPayment(issue.issueId);
    try {
      // Call API to create payment link
      const response = await customerIssueService.createReturnPaymentLink(issue.issueId);
      
      const checkoutUrl = response.checkoutUrl;
      
      // Redirect to PayOS
      if (checkoutUrl) {
        window.location.href = checkoutUrl; // Full redirect instead of window.open
        message.success('Đang chuyển đến trang thanh toán...');
      } else {
        message.error('Không tìm thấy link thanh toán. Vui lòng thử lại sau.');
      }
    } catch (error: any) {
      message.error(error.message || 'Không thể tạo link thanh toán');
      console.error('Payment error:', error);
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return isInTab ? (
      <div className="text-center py-8">
        <Spin size="large" />
        <p className="mt-4 text-gray-500">Đang tải thông tin...</p>
      </div>
    ) : (
      <Card title="Sự cố trả hàng" className="mb-4">
        <div className="text-center py-8">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (mappedIssues.length === 0) {
    // Show empty state in tab, hide component if standalone
    if (isInTab) {
      return (
        <div className="text-center py-12">
          <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Không có vấn đề trả hàng
          </h3>
          <p className="text-gray-500">
            Đơn hàng của bạn chưa có vấn đề trả hàng nào.
          </p>
        </div>
      );
    }
    return null; // Don't show section if no issues (standalone)
  }

  // Count pending payments
  const pendingPayments = mappedIssues.filter(
    issue => issue.status === 'IN_PROGRESS' && issue.returnTransaction?.status === 'PENDING'
  ).length;

  return (
    <>
      <Card 
        title={
          <div className="flex items-center justify-between">
            <span>
              <ExclamationCircleOutlined className="mr-2 text-orange-500" />
              Sự cố trả hàng
            </span>
            {pendingPayments > 0 && (
              <Badge count={pendingPayments} showZero={false}>
                <Tag color="warning">Cần thanh toán</Tag>
              </Badge>
            )}
          </div>
        }
        className="mb-4"
      >
        {/* Pending Payments Alert */}
        {pendingPayments > 0 && (
          <Alert
            message="Có giao dịch chờ thanh toán"
            description="Bạn có phí trả hàng cần thanh toán. Vui lòng thanh toán trước hạn để tài xế có thể trả hàng về cho bạn."
            type="warning"
            showIcon
            className="mb-4"
          />
        )}

        {/* Issues List */}
        <div className="space-y-3">
          {mappedIssues.map((issue) => (
            <Card
              key={issue.issueId}
              className="mb-4 shadow-lg"
              bordered={false}
              style={{ 
                borderLeft: `4px solid ${isDeadlinePassed(issue.paymentDeadline) ? '#ff4d4f' : '#1890ff'}`,
                background: isDeadlinePassed(issue.paymentDeadline) ? '#fff1f0' : '#fff'
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <ExclamationCircleOutlined className="text-xl text-orange-500" />
                    <h4 className="font-bold text-lg mb-0">
                      Mã sự cố: {issue.issueCode}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500">
                    Báo cáo lúc: {dayjs(issue.reportedAt).format('HH:mm:ss DD/MM/YYYY')}
                  </p>
                </div>
                {getStatusBadge(issue.status, issue.returnTransaction?.status)}
              </div>

              {/* Explanation Alert */}
              <Alert
                message="📦 Tại sao bạn cần thanh toán phí trả hàng?"
                description={
                  <div className="space-y-2">
                    <p className="text-sm">
                      {issue.description || 'Bạn đã từ chối nhận hàng. Các kiện hàng cần được trả về điểm lấy hàng ban đầu và bạn phải trả phí vận chuyển.'}
                    </p>
                    <div className="bg-red-50 p-2 rounded border-l-4 border-red-400">
                      <p className="text-sm font-semibold text-red-700">
                        🚫 Nếu không thanh toán: Các kiện hàng sẽ <strong>TỰ ĐỘNG BỊ HỦY</strong> khi hết thời hạn và không có khoản hoàn tiền cho sự cố này.
                      </p>
                    </div>
                  </div>
                }
                type="warning"
                showIcon
                className="mb-4"
              />

              {/* Affected Packages - Improved Card Style */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <InboxOutlined className="text-xl text-blue-600" />
                  <span className="text-base font-bold text-blue-800">
                    Các kiện hàng bị từ chối ({issue.affectedOrderDetails.length} kiện)
                  </span>
                </div>
                
                <div className="space-y-2">
                  {issue.affectedOrderDetails.map((pkg: any, index: number) => (
                    <Card
                      key={pkg.trackingCode || `pkg-${index}`}
                      size="small"
                      className="shadow-sm hover:shadow-md transition-shadow"
                      style={{ 
                        borderLeft: '4px solid #1890ff',
                        background: 'linear-gradient(to right, #f0f7ff 0%, #ffffff 10%)'
                      }}
                    >
                      <Row gutter={[16, 8]} align="middle">
                        <Col span={24}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Tag color="blue" className="text-xs font-semibold px-2 py-0.5">
                                #{index + 1}
                              </Tag>
                              <Tag color="processing" className="text-xs font-mono">
                                {pkg.trackingCode || 'N/A'}
                              </Tag>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-blue-700 text-base">
                                {pkg.weightBaseUnit?.toFixed(2) || '0.00'}
                              </span>
                              <span className="text-sm text-gray-600 ml-1">
                                {pkg.unit || 'kg'}
                              </span>
                            </div>
                          </div>
                        </Col>
                        
                        {pkg.description && (
                          <Col span={24}>
                            <div className="pl-2 border-l-2 border-blue-200">
                              <span className="text-xs text-gray-500 font-semibold">Mô tả:</span>
                              <p className="text-sm text-gray-700 mb-0 mt-0.5">
                                {pkg.description}
                              </p>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </Card>
                  ))}
                </div>
                
                {/* Total Weight Summary */}
                <Card 
                  size="small" 
                  className="mt-3 bg-blue-50 border-blue-300"
                  style={{ borderLeft: '4px solid #1890ff' }}
                >
                  <Row justify="space-between" align="middle">
                    <Col>
                      <span className="text-sm font-bold text-blue-800">
                        Tổng trọng lượng:
                      </span>
                    </Col>
                    <Col>
                      <span className="text-lg font-bold text-blue-700">
                        {issue.affectedOrderDetails.reduce((sum: number, pkg: any) => 
                          sum + (pkg.weightBaseUnit || 0), 0
                        ).toFixed(2)} kg
                      </span>
                    </Col>
                  </Row>
                </Card>
              </div>

              {/* Payment Info */}
              {issue.finalFee && (
                <Card 
                  className="mb-4"
                  style={{
                    background: isDeadlinePassed(issue.paymentDeadline) ? '#fff7e6' : '#e6f7ff',
                    borderColor: isDeadlinePassed(issue.paymentDeadline) ? '#ffa940' : '#91d5ff'
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <DollarOutlined className="text-xl" />
                      <span className="text-base font-semibold">Phí trả hàng:</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: '#1890ff' }}>
                      {formatCurrency(issue.finalFee)}
                    </span>
                  </div>
                  
                  {issue.paymentDeadline && (issue.returnTransaction?.status === 'PENDING' || !issue.returnTransaction) && (
                    <>
                      <div className="border-t pt-4 mt-3">
                        <div className="text-center mb-3">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <ClockCircleOutlined className={isDeadlinePassed(issue.paymentDeadline) ? 'text-red-500' : 'text-orange-500'} />
                            <span className="text-sm font-medium text-gray-600">
                              Thời gian còn lại:
                            </span>
                          </div>
                          
                          {/* Countdown Timer */}
                          <div className="flex justify-center mb-2">
                            {isDeadlinePassed(issue.paymentDeadline) ? (
                              <div className="text-center">
                                <div className="text-5xl font-bold text-red-600 mb-1">
                                  Hết hạn
                                </div>
                                {/* <div className="text-sm text-red-500">
                                  ❌ Đã quá thời gian thanh toán
                                </div> */}
                              </div>
                            ) : (
                              <Statistic.Countdown
                                value={dayjs(issue.paymentDeadline).valueOf()}
                                format="mm:ss"
                                valueStyle={{
                                  fontSize: '42px',
                                  fontWeight: 'bold',
                                  background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  fontFamily: 'monospace'
                                }}
                                suffix={
                                  <span className="text-sm text-gray-500 ml-2">phút:giây</span>
                                }
                              />
                            )}
                          </div>
                          
                          {/* Deadline text */}
                          <div className="text-sm text-gray-600">
                            {isDeadlinePassed(issue.paymentDeadline) ? (
                              <span className="text-red-600 font-semibold">
                                Đã quá hạn lúc: {formatDeadline(issue.paymentDeadline)}
                              </span>
                            ) : (
                              <span>
                                Hết hạn: <span className="font-semibold">{formatDeadline(issue.paymentDeadline)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isDeadlinePassed(issue.paymentDeadline) && (
                        <Alert
                          message="❌ Đã hết hạn thanh toán"
                          description="Các kiện hàng đã bị hủy do không thanh toán phí trả hàng trong thời hạn quy định."
                          type="error"
                          showIcon
                          icon={<WarningOutlined />}
                          className="mt-3"
                        />
                      )}
                      
                      {!isDeadlinePassed(issue.paymentDeadline) && (
                        <Alert
                          message="⏰ Hãy thanh toán ngay!"
                          description="Nếu không thanh toán trước thời hạn, các kiện hàng sẽ tự động bị hủy."
                          type="warning"
                          showIcon
                          className="mt-3"
                        />
                      )}
                    </>
                  )}
                </Card>
              )}

              {/* Action Buttons */}
              {issue.status === 'IN_PROGRESS' && (!issue.returnTransaction || issue.returnTransaction?.status === 'PENDING') && (
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  onClick={() => handlePaymentClick(issue)}
                  block
                  size="large"
                  disabled={isDeadlinePassed(issue.paymentDeadline)}
                  loading={processingPayment === issue.issueId}
                  danger={!isDeadlinePassed(issue.paymentDeadline)}
                  className="font-semibold"
                  style={{ height: '48px' }}
                >
                  {isDeadlinePassed(issue.paymentDeadline) ? (
                    <span>Đã hết hạn thanh toán</span>
                  ) : (
                    <span>Thanh toán ngay qua PayOS</span>
                  )}
                </Button>
              )}

              {issue.status === 'RESOLVED' && issue.returnTransaction?.status === 'PAID' && (
                <Alert
                  message="✅ Đã thanh toán thành công"
                  description="Tài xế đang tiến hành trả hàng về điểm lấy hàng. Vui lòng theo dõi trạng thái vận chuyển."
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                />
              )}

              {issue.status === 'RESOLVED' && issue.returnTransaction?.status !== 'PAID' && (
                <Alert
                  message="❌ Đã hủy do hết hạn"
                  description="Các kiện hàng bị từ chối đã được hủy do không thanh toán phí trả hàng trong thời hạn quy định."
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                />
              )}
            </Card>
          ))}
        </div>
      </Card>
    </>
  );
};

export default ReturnShippingIssuesSection;
