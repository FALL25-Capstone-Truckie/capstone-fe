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
  Modal,
  Spin,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  InfoCircleOutlined,
  CarOutlined,
  ProfileOutlined,
  ClockCircleOutlined,
  NumberOutlined,
  FileTextOutlined,
  BoxPlotOutlined,
  ColumnWidthOutlined,
  CreditCardOutlined,
  PrinterOutlined,
  CameraOutlined,
  WarningOutlined,
  VideoCameraOutlined,
  FireOutlined,
  DashboardOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import orderService from "../../../../services/order/orderService";
import type { StaffOrderDetailResponse } from "../../../../services/order/types";
import OrderStatusSection from "./StaffOrderDetail/OrderStatusSection";
import AddressSection from "./StaffOrderDetail/AddressSection";
import VehicleInfoSection from "./StaffOrderDetail/VehicleInfoSection";
import StaffContractSection from "./StaffContractSection";
import TransactionSection from "../../../Orders/components/CustomerOrderDetail/TransactionSection";
import VehicleAssignmentModal from "./VehicleAssignmentModal";
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
            <div className="flex items-center">
              <InfoCircleOutlined className="mr-2 text-blue-500" />
              <span className="font-medium">Thông tin đơn hàng</span>
            </div>
          }
        >
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="mb-2">
              <span className="font-medium">Mô tả:</span>{" "}
              {order.packageDescription || "Không có mô tả"}
            </p>
            <p className="mb-2">
              <span className="font-medium">Số lượng:</span>{" "}
              {order.totalQuantity}
            </p>
            <p className="mb-0">
              <span className="font-medium">Loại hàng:</span>{" "}
              {order.categoryName || "Chưa phân loại"}
            </p>
          </div>

          {order.notes && (
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2 text-gray-700 flex items-center">
                <InfoCircleOutlined className="mr-2 text-blue-500" /> Ghi chú
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-0">{order.notes}</p>
              </div>
            </div>
          )}
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
        {/* {contract && <StaffContractSection contract={contract} />} */}

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

    // Kiểm tra xem đơn hàng đã được phân công cho tài xế chưa
    const isAssignedToDriver =
      order.status === OrderStatusEnum.ASSIGNED_TO_DRIVER ||
      order.status === OrderStatusEnum.DRIVER_CONFIRM ||
      order.status === OrderStatusEnum.PICKED_UP ||
      order.status === OrderStatusEnum.SEALED_COMPLETED ||
      order.status === OrderStatusEnum.ON_DELIVERED ||
      order.status === OrderStatusEnum.ONGOING_DELIVERED ||
      order.status === OrderStatusEnum.IN_DELIVERED;

    // Nếu đã phân công cho tài xế, hiển thị theo vehicle assignment
    if (isAssignedToDriver) {
      // Nhóm các order details theo vehicle assignment
      interface VehicleAssignmentGroup {
        vehicleAssignment: any;
        orderDetails: any[];
      }

      const vehicleAssignmentMap = new Map<string, VehicleAssignmentGroup>();

      order.orderDetails.forEach((detail) => {
        if (detail.vehicleAssignment) {
          const vaId = detail.vehicleAssignment.id;
          if (!vehicleAssignmentMap.has(vaId)) {
            vehicleAssignmentMap.set(vaId, {
              vehicleAssignment: detail.vehicleAssignment,
              orderDetails: [],
            });
          }
          vehicleAssignmentMap.get(vaId)?.orderDetails.push(detail);
        }
      });

      const vehicleAssignments = Array.from(vehicleAssignmentMap.values());

      if (vehicleAssignments.length === 0) {
        return <Empty description="Chưa có thông tin phân công xe" />;
      }

      return (
        <Tabs
          activeKey={activeDetailTab}
          onChange={setActiveDetailTab}
          type="card"
          className="order-detail-tabs"
        >
          {vehicleAssignments.map((vaGroup, index) => (
            <TabPane
              tab={
                <span>
                  <CarOutlined /> Chuyến xe #{index + 1} -{" "}
                  {vaGroup.vehicleAssignment.trackingCode || "Chưa có mã"}
                </span>
              }
              key={index.toString()}
            >
              {/* Thông tin phương tiện */}
              <VehicleInfoSection
                vehicleAssignment={vaGroup.vehicleAssignment}
              />

              {/* Tabs cho các thông tin chi tiết */}
              <Card className="mb-6 shadow-md rounded-xl">
                <Tabs defaultActiveKey="orderDetails" type="card">
                  {/* Tab danh sách lô hàng */}
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
                          {vaGroup.orderDetails.map((detail, detailIndex) => (
                            <tr key={detail.id}>
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabPane>

                  {/* Tab lịch sử hành trình */}
                  {vaGroup.vehicleAssignment.journeyHistories &&
                    vaGroup.vehicleAssignment.journeyHistories.length > 0 && (
                      <TabPane
                        tab={
                          <span>
                            <ClockCircleOutlined /> Lịch sử hành trình
                          </span>
                        }
                        key="journey"
                      >
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                                Thời gian bắt đầu
                              </th>
                              <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                                Thời gian kết thúc
                              </th>
                              <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                                Trạng thái
                              </th>
                              <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                                Quãng đường
                              </th>
                              <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                                Báo cáo sự cố
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {vaGroup.vehicleAssignment.journeyHistories.map(
                              (journey: any) => (
                                <tr key={journey.id}>
                                  <td className="border border-gray-300 p-2">
                                    {formatDate(journey.startTime)}
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    {formatDate(journey.endTime)}
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    {journey.status}
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    {journey.totalDistance} km
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    {journey.isReportedIncident ? (
                                      <Tag color="red">Có</Tag>
                                    ) : (
                                      <Tag color="green">Không</Tag>
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </TabPane>
                    )}

                  {/* Tab niêm phong */}
                  {vaGroup.vehicleAssignment.orderSeals &&
                    vaGroup.vehicleAssignment.orderSeals.length > 0 && (
                      <TabPane
                        tab={
                          <span>
                            <FileTextOutlined /> Niêm phong
                          </span>
                        }
                        key="seals"
                      >
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                                Mô tả
                              </th>
                              <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                                Ngày niêm phong
                              </th>
                              <th className="border border-gray-300 bg-gray-50 p-2 text-left">
                                Trạng thái
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {vaGroup.vehicleAssignment.orderSeals.map((seal: any) => (
                              <tr key={seal.id}>
                                <td className="border border-gray-300 p-2">
                                  {seal.description}
                                </td>
                                <td className="border border-gray-300 p-2">
                                  {formatDate(seal.sealDate)}
                                </td>
                                <td className="border border-gray-300 p-2">
                                  <Tag color={
                                    seal.status === "PENDING"
                                      ? "orange"
                                      : seal.status === "PROCESSING"
                                        ? "blue"
                                        : seal.status === "COMPLETED"
                                          ? "green"
                                          : "default"
                                  }>
                                    {seal.status}
                                  </Tag>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </TabPane>
                    )}

                  {/* Tab sự cố */}
                  {vaGroup.vehicleAssignment.issue && (
                    <TabPane
                      tab={
                        <span>
                          <InfoCircleOutlined /> Sự cố
                        </span>
                      }
                      key="issues"
                    >
                      <div className="p-2">
                        <div className="bg-red-50 p-4 rounded-lg mb-3">
                          <div className="flex items-center mb-3">
                            <InfoCircleOutlined className="text-red-500 mr-2" />
                            <span className="font-medium">Mô tả sự cố:</span>
                            <span className="ml-2">
                              {vaGroup.vehicleAssignment.issue.issue.description}
                            </span>
                            <Tag
                              className="ml-2"
                              color={
                                vaGroup.vehicleAssignment.issue.issue.status === "PENDING"
                                  ? "orange"
                                  : vaGroup.vehicleAssignment.issue.issue.status === "PROCESSING"
                                    ? "blue"
                                    : vaGroup.vehicleAssignment.issue.issue.status === "RESOLVED"
                                      ? "green"
                                      : "red"
                              }
                            >
                              {vaGroup.vehicleAssignment.issue.issue.status}
                            </Tag>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center">
                              <InfoCircleOutlined className="mr-2 text-gray-500" />
                              <span className="font-medium mr-1">
                                Loại sự cố:
                              </span>
                              <span>
                                {vaGroup.vehicleAssignment.issue.issue.issueTypeName}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <InfoCircleOutlined className="mr-2 text-gray-500" />
                              <span className="font-medium mr-1">
                                Nhân viên xử lý:
                              </span>
                              <span>
                                {vaGroup.vehicleAssignment.issue.issue.staff.name}
                              </span>
                            </div>
                          </div>

                          {vaGroup.vehicleAssignment.issue.imageUrls &&
                            vaGroup.vehicleAssignment.issue.imageUrls.length > 0 ? (
                            <div className="mt-4">
                              <div className="flex items-center mb-2">
                                <CameraOutlined className="mr-2 text-blue-500" />
                                <span className="font-medium">Hình ảnh:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {vaGroup.vehicleAssignment.issue.imageUrls.map(
                                  (url: string, idx: number) => (
                                    <Image
                                      key={idx}
                                      src={url}
                                      alt={`Issue image ${idx + 1}`}
                                      width={100}
                                      height={100}
                                      className="object-cover rounded"
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 text-gray-500">
                              <CameraOutlined className="mr-2" />
                              <span>Chưa có hình ảnh</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabPane>
                  )}

                  {/* Tab hình ảnh hoàn thành */}
                  {vaGroup.vehicleAssignment.photoCompletions &&
                    vaGroup.vehicleAssignment.photoCompletions.length > 0 && (
                      <TabPane
                        tab={
                          <span>
                            <CameraOutlined /> Hình ảnh hoàn thành
                          </span>
                        }
                        key="photos"
                      >
                        <div className="p-2">
                          <div className="flex items-center mb-3">
                            <CameraOutlined className="mr-2 text-blue-500" />
                            <span className="font-medium">
                              Hình ảnh hoàn thành:
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {vaGroup.vehicleAssignment.photoCompletions.map(
                              (url: string, idx: number) => (
                                <Image
                                  key={idx}
                                  src={url}
                                  alt={`Completion photo ${idx + 1}`}
                                  width={100}
                                  height={100}
                                  className="object-cover rounded"
                                />
                              )
                            )}
                          </div>
                        </div>
                      </TabPane>
                    )}
                </Tabs>
              </Card>
            </TabPane>
          ))}
        </Tabs>
      );
    }

    // Nếu chưa phân công, hiển thị theo từng order detail như cũ
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
        <StaffContractSection contract={contract} />

        {/* Transaction Information */}
        <TransactionSection transactions={transactions} />
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
      </Tabs >

      {/* Additional navigation tabs for vehicle details */}
      {orderData && orderData.order && orderData.order.status !== OrderStatusEnum.ON_PLANNING && (
        <Card className="mt-4 shadow-md rounded-xl">
          <Tabs defaultActiveKey="packageList" type="card">
            <TabPane
              tab={
                <span>
                  <BoxPlotOutlined /> Danh sách lô hàng
                </span>
              }
              key="packageList"
            >
              {/* Package list content */}
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
                    {orderData.order.orderDetails.map((detail) => (
                      <tr key={detail.id}>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </TabPane>

            {/* Tab lịch sử hành trình - Frequently used */}
            <TabPane
              tab={
                <span>
                  <ClockCircleOutlined /> Lịch sử hành trình
                </span>
              }
              key="journey"
            >
              {orderData.order.orderDetails.some(detail =>
                detail.vehicleAssignment &&
                detail.vehicleAssignment.journeyHistories &&
                detail.vehicleAssignment.journeyHistories.length > 0
              ) ? (
                <div>
                  {orderData.order.orderDetails
                    .filter(detail =>
                      detail.vehicleAssignment &&
                      detail.vehicleAssignment.journeyHistories &&
                      detail.vehicleAssignment.journeyHistories.length > 0
                    )
                    .map((detail, idx) => {
                      const va = detail.vehicleAssignment!;
                      return (
                        <div key={idx} className="mb-4">
                          <h3 className="font-medium mb-2">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Thời gian bắt đầu</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Thời gian kết thúc</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Trạng thái</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Quãng đường</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Báo cáo sự cố</th>
                              </tr>
                            </thead>
                            <tbody>
                              {va.journeyHistories!.map((journey: any) => (
                                <tr key={journey.id}>
                                  <td className="border border-gray-300 p-2">{formatDate(journey.startTime)}</td>
                                  <td className="border border-gray-300 p-2">{formatDate(journey.endTime)}</td>
                                  <td className="border border-gray-300 p-2">{journey.status}</td>
                                  <td className="border border-gray-300 p-2">{journey.totalDistance} km</td>
                                  <td className="border border-gray-300 p-2">
                                    {journey.isReportedIncident ? (
                                      <Tag color="red">Có</Tag>
                                    ) : (
                                      <Tag color="green">Không</Tag>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })
                  }
                </div>
              ) : (
                <Empty description="Không có lịch sử hành trình" />
              )}
            </TabPane>

            {/* Tab sự cố - Important to monitor */}
            <TabPane
              tab={
                <span>
                  <InfoCircleOutlined /> Sự cố
                </span>
              }
              key="issues"
            >
              {orderData.order.orderDetails.some(detail =>
                detail.vehicleAssignment &&
                detail.vehicleAssignment.issues &&
                detail.vehicleAssignment.issues.length > 0
              ) ? (
                <div className="p-2">
                  {orderData.order.orderDetails
                    .filter(detail =>
                      detail.vehicleAssignment &&
                      detail.vehicleAssignment.issues &&
                      detail.vehicleAssignment.issues.length > 0
                    )
                    .map((detail, idx) => {
                      const va = detail.vehicleAssignment!;
                      return (
                        <div key={idx} className="mb-4">
                          <h3 className="font-medium mb-2">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                          {va.issues!.map((issueItem, issueIdx) => (
                            <div key={issueIdx} className="bg-red-50 p-4 rounded-lg mb-3">
                              <div className="flex items-center mb-3">
                                <InfoCircleOutlined className="text-red-500 mr-2" />
                                <span className="font-medium">Mô tả sự cố:</span>
                                <span className="ml-2">
                                  {issueItem.issue.description}
                                </span>
                                <Tag
                                  className="ml-2"
                                  color={
                                    issueItem.issue.status === "PENDING"
                                      ? "orange"
                                      : issueItem.issue.status === "PROCESSING"
                                        ? "blue"
                                        : issueItem.issue.status === "RESOLVED"
                                          ? "green"
                                          : "red"
                                  }
                                >
                                  {issueItem.issue.status}
                                </Tag>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center">
                                  <InfoCircleOutlined className="mr-2 text-gray-500" />
                                  <span className="font-medium mr-1">
                                    Loại sự cố:
                                  </span>
                                  <span>
                                    {issueItem.issue.issueTypeName}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <InfoCircleOutlined className="mr-2 text-gray-500" />
                                  <span className="font-medium mr-1">
                                    Nhân viên xử lý:
                                  </span>
                                  <span>
                                    {issueItem.issue.staff.name}
                                  </span>
                                </div>
                              </div>

                              {issueItem.imageUrls &&
                                issueItem.imageUrls.length > 0 ? (
                                <div className="mt-4">
                                  <div className="flex items-center mb-2">
                                    <CameraOutlined className="mr-2 text-blue-500" />
                                    <span className="font-medium">Hình ảnh:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {issueItem.imageUrls.map(
                                      (url: string, imgIdx: number) => (
                                        <Image
                                          key={imgIdx}
                                          src={url}
                                          alt={`Issue image ${imgIdx + 1}`}
                                          width={100}
                                          height={100}
                                          className="object-cover rounded"
                                        />
                                      )
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4 text-gray-500">
                                  <CameraOutlined className="mr-2" />
                                  <span>Chưa có hình ảnh</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })
                  }
                </div>
              ) : (
                <Empty description="Không có sự cố nào được ghi nhận" />
              )}
            </TabPane>

            {/* Tab vi phạm & phạt - Important for management */}
            <TabPane
              tab={
                <span>
                  <WarningOutlined /> Vi phạm & Phạt
                </span>
              }
              key="penalties"
            >
              {orderData.order.orderDetails.some(detail =>
                detail.vehicleAssignment &&
                detail.vehicleAssignment.penalties &&
                detail.vehicleAssignment.penalties.length > 0
              ) ? (
                <div className="p-2">
                  {orderData.order.orderDetails
                    .filter(detail =>
                      detail.vehicleAssignment &&
                      detail.vehicleAssignment.penalties &&
                      detail.vehicleAssignment.penalties.length > 0
                    )
                    .map((detail, idx) => {
                      const va = detail.vehicleAssignment!;
                      return (
                        <div key={idx} className="mb-4">
                          <h3 className="font-medium mb-2">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Loại vi phạm</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Mô tả</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Số tiền phạt</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Ngày vi phạm</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              {va.penalties!.map((penalty: any) => (
                                <tr key={penalty.id}>
                                  <td className="border border-gray-300 p-2">{penalty.violationType}</td>
                                  <td className="border border-gray-300 p-2">{penalty.violationDescription}</td>
                                  <td className="border border-gray-300 p-2">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(penalty.penaltyAmount)}
                                  </td>
                                  <td className="border border-gray-300 p-2">{formatDate(penalty.penaltyDate)}</td>
                                  <td className="border border-gray-300 p-2">
                                    <Tag color={
                                      penalty.status === "PAID"
                                        ? "green"
                                        : penalty.status === "PENDING"
                                          ? "orange"
                                          : "red"
                                    }>
                                      {penalty.status}
                                    </Tag>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })
                  }
                </div>
              ) : (
                <Empty description="Không có thông tin vi phạm" />
              )}
            </TabPane>

            {/* Tab niêm phong - Important for delivery process */}
            <TabPane
              tab={
                <span>
                  <FileTextOutlined /> Niêm phong
                </span>
              }
              key="seals"
            >
              {orderData.order.orderDetails.some(detail =>
                detail.vehicleAssignment &&
                detail.vehicleAssignment.orderSeals &&
                detail.vehicleAssignment.orderSeals.length > 0
              ) ? (
                <div className="p-2">
                  {orderData.order.orderDetails
                    .filter(detail =>
                      detail.vehicleAssignment &&
                      detail.vehicleAssignment.orderSeals &&
                      detail.vehicleAssignment.orderSeals.length > 0
                    )
                    .map((detail, idx) => {
                      const va = detail.vehicleAssignment!;
                      return (
                        <div key={idx} className="mb-4">
                          <h3 className="font-medium mb-2">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Mô tả</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Ngày niêm phong</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              {va.orderSeals!.map((seal: any) => (
                                <tr key={seal.id}>
                                  <td className="border border-gray-300 p-2">{seal.description}</td>
                                  <td className="border border-gray-300 p-2">{formatDate(seal.sealDate)}</td>
                                  <td className="border border-gray-300 p-2">
                                    <Tag color={
                                      seal.status === "PENDING"
                                        ? "orange"
                                        : seal.status === "PROCESSING"
                                          ? "blue"
                                          : seal.status === "COMPLETED"
                                            ? "green"
                                            : "default"
                                    }>
                                      {seal.status}
                                    </Tag>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })
                  }
                </div>
              ) : (
                <Empty description="Không có thông tin niêm phong" />
              )}
            </TabPane>

            {/* Tab camera theo dõi */}
            <TabPane
              tab={
                <span>
                  <VideoCameraOutlined /> Camera theo dõi
                </span>
              }
              key="cameras"
            >
              {orderData.order.orderDetails.some(detail =>
                detail.vehicleAssignment &&
                detail.vehicleAssignment.cameraTrackings &&
                detail.vehicleAssignment.cameraTrackings.length > 0
              ) ? (
                <div className="p-2">
                  {orderData.order.orderDetails
                    .filter(detail =>
                      detail.vehicleAssignment &&
                      detail.vehicleAssignment.cameraTrackings &&
                      detail.vehicleAssignment.cameraTrackings.length > 0
                    )
                    .map((detail, idx) => {
                      const va = detail.vehicleAssignment!;
                      return (
                        <div key={idx} className="mb-4">
                          <h3 className="font-medium mb-2">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Thiết bị</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Thời gian</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Trạng thái</th>
                                <th className="border border-gray-300 bg-gray-50 p-2 text-left">Hành động</th>
                              </tr>
                            </thead>
                            <tbody>
                              {va.cameraTrackings!.map((camera: any) => (
                                <tr key={camera.id}>
                                  <td className="border border-gray-300 p-2">{camera.deviceName}</td>
                                  <td className="border border-gray-300 p-2">{formatDate(camera.trackingAt)}</td>
                                  <td className="border border-gray-300 p-2">
                                    <Tag color={
                                      camera.status === "ACTIVE"
                                        ? "green"
                                        : camera.status === "INACTIVE"
                                          ? "red"
                                          : "default"
                                    }>
                                      {camera.status}
                                    </Tag>
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    {camera.videoUrl && (
                                      <a href={camera.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                                        <VideoCameraOutlined className="mr-2" />
                                        Xem video
                                      </a>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })
                  }
                </div>
              ) : (
                <Empty description="Không có dữ liệu camera theo dõi" />
              )}
            </TabPane>

            {/* Tab tiêu thụ nhiên liệu */}
            <TabPane
              tab={
                <span>
                  <FireOutlined /> Tiêu thụ nhiên liệu
                </span>
              }
              key="fuel"
            >
              {orderData.order.orderDetails.some(detail =>
                detail.vehicleAssignment &&
                detail.vehicleAssignment.fuelConsumption
              ) ? (
                <div className="p-2">
                  {orderData.order.orderDetails
                    .filter(detail =>
                      detail.vehicleAssignment &&
                      detail.vehicleAssignment.fuelConsumption
                    )
                    .map((detail, idx) => {
                      const va = detail.vehicleAssignment!;
                      const fuel = va.fuelConsumption!;
                      return (
                        <div key={idx} className="mb-4">
                          <h3 className="font-medium mb-2">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                          <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center">
                                <DashboardOutlined className="mr-2 text-gray-500" />
                                <span className="font-medium mr-1">Chỉ số đồng hồ khi nạp:</span>
                                <span>{fuel.odometerReadingAtRefuel} km</span>
                              </div>
                              <div className="flex items-center">
                                <FireOutlined className="mr-2 text-gray-500" />
                                <span className="font-medium mr-1">Loại nhiên liệu:</span>
                                <span>{fuel.fuelTypeName}</span>
                              </div>
                              <div className="flex items-center">
                                <FileTextOutlined className="mr-2 text-gray-500" />
                                <span className="font-medium mr-1">Mô tả nhiên liệu:</span>
                                <span>{fuel.fuelTypeDescription}</span>
                              </div>
                              <div className="flex items-center">
                                <CalendarOutlined className="mr-2 text-gray-500" />
                                <span className="font-medium mr-1">Ngày ghi nhận:</span>
                                <span>{formatDate(fuel.dateRecorded)}</span>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-start">
                                <FileTextOutlined className="mr-2 text-gray-500 mt-1" />
                                <span className="font-medium mr-1">Ghi chú:</span>
                                <span>{fuel.notes || "Không có ghi chú"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {fuel.odometerAtStartUrl && (
                              <div>
                                <div className="flex items-center mb-2">
                                  <DashboardOutlined className="mr-2 text-blue-500" />
                                  <span className="font-medium">Đồng hồ khi bắt đầu</span>
                                </div>
                                <Image
                                  src={fuel.odometerAtStartUrl}
                                  alt="Odometer at start"
                                  className="object-cover rounded"
                                />
                              </div>
                            )}
                            {fuel.odometerAtFinishUrl && (
                              <div>
                                <div className="flex items-center mb-2">
                                  <DashboardOutlined className="mr-2 text-blue-500" />
                                  <span className="font-medium">Đồng hồ khi hoàn thành</span>
                                </div>
                                <Image
                                  src={fuel.odometerAtFinishUrl}
                                  alt="Odometer at finish"
                                  className="object-cover rounded"
                                />
                              </div>
                            )}
                            {fuel.odometerAtEndUrl && (
                              <div>
                                <div className="flex items-center mb-2">
                                  <DashboardOutlined className="mr-2 text-blue-500" />
                                  <span className="font-medium">Đồng hồ khi kết thúc</span>
                                </div>
                                <Image
                                  src={fuel.odometerAtEndUrl}
                                  alt="Odometer at end"
                                  className="object-cover rounded"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              ) : (
                <Empty description="Không có dữ liệu tiêu thụ nhiên liệu" />
              )}
            </TabPane>

            {/* Tab hình ảnh hoàn thành */}
            <TabPane
              tab={
                <span>
                  <CameraOutlined /> Hình ảnh hoàn thành
                </span>
              }
              key="photos"
            >
              {orderData.order.orderDetails.some(detail =>
                detail.vehicleAssignment &&
                detail.vehicleAssignment.photoCompletions &&
                detail.vehicleAssignment.photoCompletions.length > 0
              ) ? (
                <div className="p-2">
                  {orderData.order.orderDetails
                    .filter(detail =>
                      detail.vehicleAssignment &&
                      detail.vehicleAssignment.photoCompletions &&
                      detail.vehicleAssignment.photoCompletions.length > 0
                    )
                    .map((detail, idx) => {
                      const va = detail.vehicleAssignment!;
                      return (
                        <div key={idx} className="mb-4">
                          <h3 className="font-medium mb-2">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                          <div className="flex flex-wrap gap-2">
                            {va.photoCompletions!.map(
                              (url: string, photoIdx: number) => (
                                <Image
                                  key={photoIdx}
                                  src={url}
                                  alt={`Completion photo ${photoIdx + 1}`}
                                  width={100}
                                  height={100}
                                  className="object-cover rounded"
                                />
                              )
                            )}
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              ) : (
                <Empty description="Không có hình ảnh hoàn thành" />
              )}
            </TabPane>
          </Tabs>
        </Card>
      )}

      {/* Vehicle Assignment Modal */}
      {
        id && orderData && orderData.order && orderData.order.orderDetails && (
          <VehicleAssignmentModal
            visible={vehicleAssignmentModalVisible}
            orderId={id}
            orderDetails={orderData.order.orderDetails}
            onClose={() => setVehicleAssignmentModalVisible(false)}
            onSuccess={handleVehicleAssignmentSuccess}
          />
        )
      }

      {/* Bill of Lading Preview Modal */}
      <Modal
        title="Xem trước vận đơn"
        open={billOfLadingPreviewVisible}
        onCancel={() => setBillOfLadingPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setBillOfLadingPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              if (billOfLadingPreviewData && billOfLadingPreviewData.length > 0) {
                // Open a new window with the PDF content for printing
                billOfLadingPreviewData.forEach(doc => {
                  const newWindow = window.open('', '_blank');
                  if (newWindow) {
                    newWindow.document.write(`
                      <html>
                        <head>
                          <title>${doc.fileName}</title>
                        </head>
                        <body style="margin:0;padding:0;">
                          ${doc.mimeType.includes('pdf')
                        ? `<embed width="100%" height="100%" src="data:${doc.mimeType};base64,${doc.base64Content}" type="${doc.mimeType}" />`
                        : `<img src="data:${doc.mimeType};base64,${doc.base64Content}" style="max-width:100%;" />`
                      }
                        </body>
                      </html>
                    `);
                    newWindow.document.close();
                    setTimeout(() => {
                      newWindow.print();
                    }, 1000);
                  }
                });
              }
            }}
          >
            In vận đơn
          </Button>
        ]}
      >
        {billOfLadingPreviewLoading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" tip="Đang tải vận đơn..." />
          </div>
        ) : billOfLadingPreviewData && billOfLadingPreviewData.length > 0 ? (
          <div className="bill-of-lading-preview">
            {billOfLadingPreviewData.map((doc, index) => (
              <div key={index} className="mb-4">
                <h3>{doc.fileName}</h3>
                {doc.mimeType.includes('pdf') ? (
                  <embed
                    src={`data:${doc.mimeType};base64,${doc.base64Content}`}
                    type={doc.mimeType}
                    width="100%"
                    height="500px"
                  />
                ) : (
                  <img
                    src={`data:${doc.mimeType};base64,${doc.base64Content}`}
                    alt={doc.fileName}
                    style={{ maxWidth: '100%' }}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <Empty description="Không có dữ liệu vận đơn" />
        )}
      </Modal>
    </div >
  );
};

export default StaffOrderDetail;
