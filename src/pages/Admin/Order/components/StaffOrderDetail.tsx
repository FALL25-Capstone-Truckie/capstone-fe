import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  App,
  Button,
  Typography,
  Skeleton,
  Empty,
  Tabs,
  Card,
  Row,
  Col,
  Tag,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  InfoCircleOutlined,
  CarOutlined,
  ProfileOutlined,
  ClockCircleOutlined,
  NumberOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  ShopOutlined,
  IdcardOutlined,
  FileTextOutlined,
  BoxPlotOutlined,
  ColumnWidthOutlined,
  CreditCardOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import orderService from "../../../../services/order/orderService";
import type { StaffOrderDetailResponse } from "../../../../services/order/types";
import OrderStatusSection from "./StaffOrderDetail/OrderStatusSection";
import AddressSection from "./StaffOrderDetail/AddressSection";
import VehicleInfoSection from "./StaffOrderDetail/VehicleInfoSection";
import ContractSection from "../../../Orders/components/CustomerOrderDetail/ContractSection";
import TransactionSection from "../../../Orders/components/CustomerOrderDetail/TransactionSection";
import VehicleAssignmentModal from "./VehicleAssignmentModal";
import BillOfLadingPreviewModal from "./StaffOrderDetail/BillOfLadingPreviewModal";
import { OrderStatusEnum } from "../../../../constants/enums";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(timezone);

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const StaffOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messageApi = App.useApp().message;
  const [orderData, setOrderData] = useState<
    StaffOrderDetailResponse["data"] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMainTab, setActiveMainTab] = useState<string>("basic");
  const [activeDetailTab, setActiveDetailTab] = useState<string>("0");
  const [vehicleAssignmentModalVisible, setVehicleAssignmentModalVisible] =
    useState<boolean>(false);
  const [billOfLadingPreviewVisible, setBillOfLadingPreviewVisible] = useState<boolean>(false);
  const [billOfLadingPreviewLoading, setBillOfLadingPreviewLoading] = useState<boolean>(false);
  const [billOfLadingPreviewData, setBillOfLadingPreviewData] = useState<Array<{
    fileName: string;
    base64Content: string;
    mimeType: string;
  }> | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

  const fetchOrderDetails = async (orderId: string) => {
    setLoading(true);
    try {
      const data = await orderService.getOrderForStaffByOrderId(orderId);
      setOrderData(data);
    } catch (error) {
      messageApi.error("Không thể tải thông tin đơn hàng");
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa có thông tin";
    return dayjs(dateString)
      .tz("Asia/Ho_Chi_Minh")
      .format("DD/MM/YYYY HH:mm:ss");
  };

  const handleVehicleAssignmentSuccess = () => {
    if (id) {
      fetchOrderDetails(id);
    }
  };

  const handlePreviewBillOfLading = async () => {
    if (!id) return;

    setBillOfLadingPreviewLoading(true);
    try {
      const data = await orderService.previewBillOfLading(id);
      setBillOfLadingPreviewData(data);
      setBillOfLadingPreviewVisible(true);
    } catch (error) {
      messageApi.error("Không thể tải vận đơn");
      console.error("Error previewing bill of lading:", error);
    } finally {
      setBillOfLadingPreviewLoading(false);
    }
  };

  // Check if order status is ASSIGNED_TO_DRIVER or later
  const canPrintBillOfLading = () => {
    if (!orderData || !orderData.order) return false;

    const orderStatus = orderData.order.status;
    const statusesAllowingPrint = [
      OrderStatusEnum.ASSIGNED_TO_DRIVER,
      OrderStatusEnum.DRIVER_CONFIRM,
      OrderStatusEnum.PICKED_UP,
      OrderStatusEnum.SEALED_COMPLETED,
      OrderStatusEnum.ON_DELIVERED,
      OrderStatusEnum.ONGOING_DELIVERED,
      OrderStatusEnum.IN_DELIVERED,
      OrderStatusEnum.IN_TROUBLES,
      OrderStatusEnum.RESOLVED,
      OrderStatusEnum.COMPENSATION,
      OrderStatusEnum.DELIVERED,
      OrderStatusEnum.SUCCESSFUL,
      OrderStatusEnum.REJECT_ORDER,
      OrderStatusEnum.RETURNING,
      OrderStatusEnum.RETURNED
    ];

    return statusesAllowingPrint.includes(orderStatus as OrderStatusEnum);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            Quay lại
          </Button>
          <Skeleton.Input style={{ width: 300 }} active />
        </div>
        <Skeleton active paragraph={{ rows: 6 }} />
        <Skeleton active paragraph={{ rows: 6 }} className="mt-6" />
        <Skeleton active paragraph={{ rows: 6 }} className="mt-6" />
      </div>
    );
  }

  if (!orderData || !orderData.order) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </div>
        <Empty description="Không tìm thấy thông tin đơn hàng" />
      </div>
    );
  }

  const { order, contract, transactions } = orderData;

  // Tab 1: Thông tin cơ bản
  const renderBasicInfoTab = () => {
    return (
      <div>
        {/* Order Status */}
        <OrderStatusSection
          orderCode={order.orderCode}
          status={order.status}
          createdAt={order.createdAt}
          totalPrice={order.totalPrice}
        />

        {/* Order Information */}
        <Card
          className="mb-6 shadow-md rounded-xl"
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <InfoCircleOutlined className="mr-2 text-blue-500" />
                <span className="font-medium">Thông tin đơn hàng</span>
              </div>
              <div className="flex gap-2">
                {order.status === OrderStatusEnum.ON_PLANNING && (
                  <Button
                    type="primary"
                    icon={<CarOutlined />}
                    onClick={() => setVehicleAssignmentModalVisible(true)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Phân công xe và tài xế
                  </Button>
                )}

                {/* Print Bill of Lading Button */}
                {/* {canPrintBillOfLading() && (
                  <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={handlePreviewBillOfLading}
                    className="bg-green-600 hover:bg-green-700"
                    loading={billOfLadingPreviewLoading}
                  >
                    In vận đơn
                  </Button>
                )} */}
              </div>
            </div>
          }
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <div className="flex items-center mb-1">
                  <NumberOutlined className="mr-2 text-blue-500" />
                  <Text strong>Mã theo dõi:</Text>
                </div>
                <div className="ml-6">{order.orderCode || "Chưa có"}</div>
              </div>
              <div className="mb-4">
                <div className="flex items-center mb-1">
                  <FileTextOutlined className="mr-2 text-blue-500" />
                  <Text strong>Ghi chú:</Text>
                </div>
                <div className="ml-6">{order.notes || "Không có ghi chú"}</div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <div className="flex items-center mb-1">
                  <BoxPlotOutlined className="mr-2 text-blue-500" />
                  <Text strong>Loại đơn hàng:</Text>
                </div>
                <div className="ml-6">
                  {order.packageDescription || "Không xác định"}
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center mb-1">
                  <ColumnWidthOutlined className="mr-2 text-blue-500" />
                  <Text strong>Số lượng:</Text>
                </div>
                <div className="ml-6">
                  {order.totalQuantity || "Không xác định"}
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Address and Contact Information */}
        <AddressSection
          pickupAddress={order.pickupAddress}
          deliveryAddress={order.deliveryAddress}
          senderRepresentativeName={order.senderRepresentativeName}
          senderRepresentativePhone={order.senderRepresentativePhone}
          senderCompanyName={order.senderCompanyName}
          receiverName={order.receiverName}
          receiverPhone={order.receiverPhone}
          receiverIdentity={order.receiverIdentity}
        />

        {/* Contract Information */}
        {/* {contract && <ContractSection contract={contract} orderId={id} />} */}

        {/* Transaction Information */}
        {/* {transactions && transactions.length > 0 && (
          <TransactionSection transactions={transactions} />
        )} */}
      </div>
    );
  };

  // Tab 2: Chi tiết vận chuyển
  const renderOrderDetailTab = () => {
    if (!order.orderDetails || order.orderDetails.length === 0) {
      return <Empty description="Không có thông tin chi tiết vận chuyển" />;
    }

    return (
      <Tabs
        activeKey={activeDetailTab}
        onChange={setActiveDetailTab}
        type="card"
        className="order-detail-tabs"
      >
        {order.orderDetails.map((detail, index) => (
          <TabPane
            tab={
              <span>
                <BoxPlotOutlined /> Kiện {index + 1}{" "}
                {detail.trackingCode ? `- ${detail.trackingCode} ` : ""}
              </span>
            }
            key={index.toString()}
          >
            <Card
              className="mb-6 shadow-md rounded-xl"
              title={
                <div className="flex items-center">
                  <InfoCircleOutlined className="mr-2 text-blue-500" />
                  <span className="font-medium">
                    Thông tin chi tiết vận chuyển
                  </span>
                </div>
              }
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Card
                    className="mb-4 h-full"
                    size="small"
                    title={
                      <div className="flex items-center">
                        <FileTextOutlined className="mr-2 text-blue-500" />
                        <span className="font-medium">Thông tin cơ bản</span>
                      </div>
                    }
                  >
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <NumberOutlined className="mr-2 text-blue-500" />
                        <Text strong>Mã theo dõi:</Text>
                      </div>
                      <div className="ml-6">
                        {detail.trackingCode || "Chưa có"}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <InfoCircleOutlined className="mr-2 text-blue-500" />
                        <Text strong>Trạng thái:</Text>
                      </div>
                      <div className="ml-6">
                        <Tag
                          color={
                            detail.status === "PENDING"
                              ? "orange"
                              : detail.status === "PROCESSING"
                                ? "blue"
                                : detail.status === "DELIVERED" ||
                                  detail.status === "SUCCESSFUL"
                                  ? "green"
                                  : detail.status === "CANCELLED" ||
                                    detail.status === "IN_TROUBLES"
                                    ? "red"
                                    : "default"
                          }
                        >
                          {detail.status}
                        </Tag>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <ColumnWidthOutlined className="mr-2 text-blue-500" />
                        <Text strong>Trọng lượng:</Text>
                      </div>
                      <div className="ml-6">
                        {detail.weightBaseUnit} {detail.unit}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <FileTextOutlined className="mr-2 text-blue-500" />
                        <Text strong>Mô tả:</Text>
                      </div>
                      <div className="ml-6">
                        {detail.description || "Không có mô tả"}
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card
                    className="mb-4 h-full"
                    size="small"
                    title={
                      <div className="flex items-center">
                        <ClockCircleOutlined className="mr-2 text-blue-500" />
                        <span className="font-medium">Thông tin thời gian</span>
                      </div>
                    }
                  >
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <ClockCircleOutlined className="mr-2 text-blue-500" />
                        <Text strong>Thời gian bắt đầu:</Text>
                      </div>
                      <div className="ml-6">{formatDate(detail.startTime)}</div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <ClockCircleOutlined className="mr-2 text-blue-500" />
                        <Text strong>Thời gian kết thúc:</Text>
                      </div>
                      <div className="ml-6">{formatDate(detail.endTime)}</div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <ClockCircleOutlined className="mr-2 text-blue-500" />
                        <Text strong>Thời gian dự kiến bắt đầu:</Text>
                      </div>
                      <div className="ml-6">
                        {formatDate(detail.estimatedStartTime)}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <ClockCircleOutlined className="mr-2 text-blue-500" />
                        <Text strong>Thời gian dự kiến kết thúc:</Text>
                      </div>
                      <div className="ml-6">
                        {formatDate(detail.estimatedEndTime)}
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              <Divider />

              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  {/* Order Size Information */}
                  {detail.orderSize && (
                    <Card
                      className="mb-4"
                      size="small"
                      title={
                        <div className="flex items-center">
                          <BoxPlotOutlined className="mr-2 text-blue-500" />
                          <span className="font-medium">
                            Thông tin kích thước
                          </span>
                        </div>
                      }
                    >
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                              Mô tả
                            </th>
                            <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                              Kích thước (Dài x Rộng x Cao)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 p-2">
                              {detail.orderSize.description}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {`${detail.orderSize.minLength} x ${detail.orderSize.minWidth} x ${detail.orderSize.minHeight} m - 
                                                            ${detail.orderSize.maxLength} x ${detail.orderSize.maxWidth} x ${detail.orderSize.maxHeight} m`}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Card>
                  )}
                </Col>

                <Col xs={24} md={12}>
                  {/* Placeholder for any additional information */}
                  {/* You can add more information here if needed */}
                </Col>
              </Row>

              {/* Vehicle Assignment Information in a separate row */}
              <Row>
                <Col xs={24}>
                  {detail.vehicleAssignment ? (
                    <Card
                      className="mb-4"
                      size="small"
                      title={
                        <div className="flex items-center">
                          <CarOutlined className="mr-2 text-blue-500" />
                          <span className="font-medium">
                            Thông tin phương tiện vận chuyển
                          </span>
                        </div>
                      }
                    >
                      <Tabs defaultActiveKey="vehicle" type="card">
                        <TabPane
                          tab={
                            <span>
                              <CarOutlined /> Thông tin phương tiện
                            </span>
                          }
                          key="vehicle"
                        >
                          <VehicleInfoSection
                            vehicleAssignment={detail.vehicleAssignment}
                          />
                        </TabPane>

                        <TabPane
                          tab={
                            <span>
                              <BoxPlotOutlined /> Danh sách lô hàng
                            </span>
                          }
                          key="orderDetails"
                        >
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr>
                                  <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                                    Mã theo dõi
                                  </th>
                                  <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                                    Trạng thái
                                  </th>
                                  <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                                    Trọng lượng
                                  </th>
                                  <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                                    Mô tả
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-300 p-2">
                                    <div className="flex items-center">
                                      <NumberOutlined className="mr-2 text-blue-500" />
                                      {detail.trackingCode || "Chưa có"}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    <Tag
                                      color={
                                        detail.status === "PENDING"
                                          ? "orange"
                                          : detail.status === "PROCESSING"
                                            ? "blue"
                                            : detail.status === "DELIVERED" ||
                                              detail.status === "SUCCESSFUL"
                                              ? "green"
                                              : detail.status === "CANCELLED" ||
                                                detail.status === "IN_TROUBLES"
                                                ? "red"
                                                : "default"
                                      }
                                    >
                                      {detail.status}
                                    </Tag>
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    <div className="flex items-center">
                                      <ColumnWidthOutlined className="mr-2 text-blue-500" />
                                      {detail.weightBaseUnit} {detail.unit}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    <div className="flex items-center">
                                      <FileTextOutlined className="mr-2 text-blue-500" />
                                      {detail.description || "Không có mô tả"}
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </TabPane>
                      </Tabs>
                    </Card>
                  ) : (
                    <Card
                      className="mb-4"
                      size="small"
                      title={
                        <div className="flex items-center">
                          <CarOutlined className="mr-2 text-blue-500" />
                          <span className="font-medium">
                            Thông tin phương tiện vận chuyển
                          </span>
                        </div>
                      }
                    >
                      <div className="text-center py-4">
                        <p className="text-gray-500 mb-4">
                          Chưa có thông tin phân công xe
                        </p>
                        {order.status === OrderStatusEnum.ON_PLANNING && (
                          <Button
                            type="primary"
                            icon={<CarOutlined />}
                            onClick={() =>
                              setVehicleAssignmentModalVisible(true)
                            }
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            Phân công xe
                          </Button>
                        )}
                      </div>
                    </Card>
                  )}
                </Col>
              </Row>
            </Card>
          </TabPane>
        ))}
      </Tabs>
    );
  };

  // Tab 3: Hợp đồng và thanh toán
  const renderContractAndPaymentTab = () => {
    return (
      <div>
        {/* Contract Information */}
        {contract && <ContractSection contract={contract} orderId={id} />}

        {/* Transaction Information */}
        {transactions && transactions.length > 0 && (
          <TransactionSection transactions={transactions} />
        )}

        {!contract && !transactions && (
          <Card className="shadow-md rounded-xl">
            <Empty description="Không có thông tin hợp đồng và thanh toán" />
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="flex items-center mb-2 md:mb-0">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            Quay lại
          </Button>
          <Title level={2} className="m-0">
            Chi tiết đơn hàng {order.orderCode}
          </Title>
        </div>
        {/* Add print button to header for better visibility */}
        {canPrintBillOfLading() && (
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePreviewBillOfLading}
            className="bg-green-600 hover:bg-green-700"
            loading={billOfLadingPreviewLoading}
            size="large"
          >
            In vận đơn
          </Button>
        )}
      </div>

      <Tabs
        activeKey={activeMainTab}
        onChange={setActiveMainTab}
        type="card"
        className="order-main-tabs"
      >
        <TabPane
          tab={
            <span>
              <InfoCircleOutlined /> Thông tin cơ bản
            </span>
          }
          key="basic"
        >
          {renderBasicInfoTab()}
        </TabPane>
        <TabPane
          tab={
            <span>
              <CarOutlined /> Chi tiết vận chuyển
            </span>
          }
          key="detail"
        >
          {renderOrderDetailTab()}
        </TabPane>
        <TabPane
          tab={
            <span>
              <CreditCardOutlined /> Hợp đồng & Thanh toán
            </span>
          }
          key="contract"
        >
          {renderContractAndPaymentTab()}
        </TabPane>
      </Tabs>

      {/* Vehicle Assignment Modal */}
      {id && orderData && orderData.order && orderData.order.orderDetails && (
        <VehicleAssignmentModal
          visible={vehicleAssignmentModalVisible}
          orderId={id}
          orderDetails={orderData.order.orderDetails}
          onClose={() => setVehicleAssignmentModalVisible(false)}
          onSuccess={handleVehicleAssignmentSuccess}
        />
      )}

      {/* Bill of Lading Preview Modal */}
      <BillOfLadingPreviewModal
        visible={billOfLadingPreviewVisible}
        loading={billOfLadingPreviewLoading}
        documents={billOfLadingPreviewData}
        onClose={() => setBillOfLadingPreviewVisible(false)}
      />
    </div>
  );
};

export default StaffOrderDetail;
