import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { App, Button, Typography, Skeleton, Empty, Tabs, Space, Card } from "antd";
import {
  ArrowLeftOutlined,
  InfoCircleOutlined,
  CarOutlined,
  CreditCardOutlined,
  PrinterOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import orderService from "../../../../services/order/orderService";
import type { StaffOrderDetailResponse } from "../../../../services/order/types";
import { OrderStatusEnum } from "../../../../constants/enums";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import {
  BasicInfoTab,
  OrderDetailTabs,
  ContractAndPaymentTab,
} from "./StaffOrderDetail/index";
import BillOfLadingPreviewModal from "./StaffOrderDetail/BillOfLadingPreviewModal";
import OrderLiveTrackingOnly from "./StaffOrderDetail/OrderLiveTrackingOnly";
import { useOrderStatusTracking } from "../../../../hooks/useOrderStatusTracking";
import { useOrderDetailStatusTracking } from "../../../../hooks/useOrderDetailStatusTracking";

dayjs.extend(timezone);

const { Title } = Typography;
const { TabPane } = Tabs;

const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messageApi = App.useApp().message;
  const [orderData, setOrderData] = useState<
    StaffOrderDetailResponse["data"] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Tab persistence with validation based on order status
  const getInitialTab = () => {
    if (!id) return "basic";
    const savedTab = localStorage.getItem(`adminOrderDetail_${id}_activeTab`);
    return savedTab || "basic";
  };
  
  const [activeMainTab, setActiveMainTab] = useState<string>(getInitialTab());
  const [billOfLadingPreviewVisible, setBillOfLadingPreviewVisible] =
    useState<boolean>(false);
  const [billOfLadingPreviewLoading, setBillOfLadingPreviewLoading] =
    useState<boolean>(false);
  const [billOfLadingPreviewData, setBillOfLadingPreviewData] = useState<Array<{
    fileName: string;
    base64Content: string;
    mimeType: string;
  }> | null>(null);

  const hasAutoSwitchedRef = useRef<boolean>(false);

  // Fetch order details
  const fetchOrderDetails = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await orderService.getOrderForStaffByOrderId(id);
      setOrderData(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      messageApi.error("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [id, messageApi]);

  // Initial fetch
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Handle order status changes via WebSocket
  const handleOrderStatusChange = useCallback((statusChange: any) => {
    if (id && statusChange.orderId === id) {
      fetchOrderDetails();
    }
  }, [id, fetchOrderDetails]);

  // Handle order detail status changes
  const handleOrderDetailStatusChange = useCallback((statusChange: any) => {
    if (id && statusChange.orderId === id) {
      fetchOrderDetails();
    }
  }, [id, fetchOrderDetails]);

  // Subscribe to order status changes - MUST be called before any conditional returns
  useOrderStatusTracking({
    orderId: id,
    autoConnect: true,
    onStatusChange: handleOrderStatusChange,
  });

  useOrderDetailStatusTracking({
    orderId: id,
    autoConnect: true,
    onStatusChange: handleOrderDetailStatusChange,
  });

  // Save active tab to localStorage
  useEffect(() => {
    if (id) {
      localStorage.setItem(`adminOrderDetail_${id}_activeTab`, activeMainTab);
    }
  }, [activeMainTab, id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không xác định";
    try {
      return dayjs(dateString).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm");
    } catch {
      return "Không xác định";
    }
  };

  // Handle bill of lading preview
  const handleBillOfLadingPreview = async () => {
    if (!id || !orderData) return;
    
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

  // Check if bill of lading can be printed
  const canPrintBillOfLading = () => {
    if (!orderData) return false;
    const orderStatus = orderData.order.status;
    const statusesAllowingPrint = [
      OrderStatusEnum.ASSIGNED_TO_DRIVER,
      OrderStatusEnum.FULLY_PAID,
      OrderStatusEnum.PICKING_UP,
      OrderStatusEnum.ON_DELIVERED,
      OrderStatusEnum.ONGOING_DELIVERED,
      OrderStatusEnum.IN_TROUBLES,
      OrderStatusEnum.RESOLVED,
      OrderStatusEnum.COMPENSATION,
      OrderStatusEnum.DELIVERED,
      OrderStatusEnum.SUCCESSFUL,
      OrderStatusEnum.REJECT_ORDER,
      OrderStatusEnum.RETURNING,
      OrderStatusEnum.RETURNED,
    ];

    return statusesAllowingPrint.includes(orderStatus as OrderStatusEnum);
  };

  const shouldShowLiveTracking =
    orderData?.order &&
    [
      OrderStatusEnum.PICKING_UP,
      OrderStatusEnum.ON_DELIVERED,
      OrderStatusEnum.ONGOING_DELIVERED,
      OrderStatusEnum.IN_TROUBLES,
      OrderStatusEnum.RESOLVED,
      OrderStatusEnum.DELIVERED,
      OrderStatusEnum.RETURNING,
    ].includes(orderData.order.status as OrderStatusEnum) &&
    orderData.order.orderDetails?.some((d: { status: string }) =>
      ![
        OrderStatusEnum.COMPENSATION,
        OrderStatusEnum.SUCCESSFUL,
        OrderStatusEnum.RETURNED,
      ].includes(d.status as OrderStatusEnum)
    );

  useEffect(() => {
    const currentStatus = orderData?.order?.status;
    const isDeliveryStatus = [
      OrderStatusEnum.PICKING_UP,
      OrderStatusEnum.ON_DELIVERED,
      OrderStatusEnum.ONGOING_DELIVERED,
      OrderStatusEnum.IN_TROUBLES,
      OrderStatusEnum.RESOLVED,
      OrderStatusEnum.DELIVERED,
      OrderStatusEnum.RETURNING,
    ].includes(currentStatus as OrderStatusEnum);

    const allDetailsInFinalStatus =
      orderData?.order?.orderDetails?.every((d: { status: string }) =>
        [
          OrderStatusEnum.COMPENSATION,
          OrderStatusEnum.SUCCESSFUL,
          OrderStatusEnum.RETURNED,
        ].includes(d.status as OrderStatusEnum)
      ) ?? true;

    if (isDeliveryStatus && !allDetailsInFinalStatus && !hasAutoSwitchedRef.current) {
      setActiveMainTab("liveTracking");
      hasAutoSwitchedRef.current = true;
    }
  }, [orderData?.order?.status, orderData?.order?.orderDetails]);

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="p-6">
        <Empty description="Không tìm thấy thông tin đơn hàng" />
      </div>
    );
  }

  const { order, contract, transactions } = orderData;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="flex items-center mb-2 md:mb-0">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mr-4"
            size="large"
          >
            Quay lại
          </Button>
          <Title level={2} className="m-0">
            Chi tiết đơn hàng {order.orderCode}
          </Title>
        </div>

        <Space size="middle">
          {canPrintBillOfLading() && (
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handleBillOfLadingPreview}
              loading={billOfLadingPreviewLoading}
              className="bg-blue-500 hover:bg-blue-600 shadow-md transition-all duration-300 flex items-center px-5 py-6 text-base"
              size="large"
            >
              In vận đơn
            </Button>
          )}
        </Space>
      </div>

      <Card className="mb-6 shadow-md rounded-xl">
        <Tabs
          activeKey={activeMainTab}
          onChange={(key) => {
            setActiveMainTab(key);
            if (key === "liveTracking") {
              setTimeout(() => {
                const mapContainer = document.getElementById("staff-live-tracking-map");
                if (mapContainer) {
                  mapContainer.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }, 200);
            }
          }}
          type="card"
          size="large"
          className="order-main-tabs"
        >
          <TabPane
            tab={
              <span className="px-2 py-1">
                <InfoCircleOutlined className="mr-2" /> Thông tin cơ bản
              </span>
            }
            key="basic"
          >
            <BasicInfoTab order={order} contract={contract} />
          </TabPane>

          <TabPane
            tab={
              <span className="px-2 py-1">
                <CarOutlined className="mr-2" /> Chi tiết vận chuyển
              </span>
            }
            key="detail"
          >
            <OrderDetailTabs order={order} formatDate={formatDate} />
          </TabPane>

          {shouldShowLiveTracking && (
            <TabPane
              tab={
                <span className="px-2 py-1">
                  <EnvironmentOutlined className="mr-2" /> Theo dõi trực tiếp
                </span>
              }
              key="liveTracking"
            >
              <OrderLiveTrackingOnly
                orderId={order.id}
                shouldShowRealTimeTracking={true}
                vehicleAssignments={order.vehicleAssignments || []}
              />
            </TabPane>
          )}

          <TabPane
            tab={
              <span className="px-2 py-1">
                <CreditCardOutlined className="mr-2" /> Hợp đồng & Thanh toán
              </span>
            }
            key="contract"
          >
            <ContractAndPaymentTab
              contract={contract}
              transactions={transactions}
              orderId={undefined}
              depositAmount={order.depositAmount}
              hasInsurance={order.hasInsurance}
              totalInsuranceFee={order.totalInsuranceFee}
              totalDeclaredValue={order.totalDeclaredValue}
              readOnly={true}
            />
          </TabPane>
        </Tabs>
      </Card>

      <BillOfLadingPreviewModal
        visible={billOfLadingPreviewVisible}
        onClose={() => setBillOfLadingPreviewVisible(false)}
        loading={billOfLadingPreviewLoading}
        documents={billOfLadingPreviewData}
      />
    </div>
  );
};

export default AdminOrderDetailPage;
