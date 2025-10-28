import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { App, Button, Typography, Skeleton, Empty, Tabs, Card, message } from "antd";
import {
  ArrowLeftOutlined,
  InfoCircleOutlined,
  CarOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import orderService from "../../../services/order/orderService";
import { contractService } from "../../../services/contract";
import { useOrderStatusTracking } from "../../../hooks/useOrderStatusTracking";
import { playImportantNotificationSound } from "../../../utils/notificationSound";
import { OrderStatusEnum, OrderStatusLabels } from "../../../constants/enums";
import type {
  CustomerOrderDetailResponse,
  VehicleSuggestion,
} from "../../../services/order/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Import components
import BasicInfoTab from "./CustomerOrderDetail/BasicInfoTab";
import OrderDetailsTab from "./CustomerOrderDetail/OrderDetailsTab";
import ContractSection from "./CustomerOrderDetail/ContractSection";
import TransactionSection from "./CustomerOrderDetail/TransactionSection";
import VehicleSuggestionsModal from "./CustomerOrderDetail/VehicleSuggestionsModal";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title } = Typography;
const { TabPane } = Tabs;

const CustomerOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messageApi = App.useApp().message;
  const [orderData, setOrderData] = useState<
    CustomerOrderDetailResponse["data"] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMainTab, setActiveMainTab] = useState<string>("basic");
  const [activeDetailTab, setActiveDetailTab] = useState<string>("0");
  const [vehicleSuggestions, setVehicleSuggestions] = useState<
    VehicleSuggestion[]
  >([]);
  const [vehicleSuggestionsModalVisible, setVehicleSuggestionsModalVisible] =
    useState<boolean>(false);
  const [loadingVehicleSuggestions, setLoadingVehicleSuggestions] =
    useState<boolean>(false);
  const [hasContract, setHasContract] = useState<boolean>(false);
  const [checkingContract, setCheckingContract] = useState<boolean>(false);
  const [creatingContract, setCreatingContract] = useState<boolean>(false);
  const [previousOrderStatus, setPreviousOrderStatus] = useState<string | null>(null);

  // NOTE: Real-time tracking logic is now handled inside RouteMapWithRealTimeTracking
  // to prevent unnecessary re-renders of CustomerOrderDetail parent component

  // Map status to notification icon and type
  const getStatusNotification = (status: string) => {
    const statusNotificationMap: Record<string, { icon: string; type: 'success' | 'error' | 'warning' | 'info'; duration: number }> = {
      [OrderStatusEnum.PENDING]: { icon: '⏳', type: 'info', duration: 3 },
      [OrderStatusEnum.PROCESSING]: { icon: '⚙️', type: 'info', duration: 3 },
      [OrderStatusEnum.CONTRACT_DRAFT]: { icon: '📝', type: 'info', duration: 3 },
      [OrderStatusEnum.CONTRACT_SIGNED]: { icon: '✍️', type: 'success', duration: 4 },
      [OrderStatusEnum.ON_PLANNING]: { icon: '📋', type: 'info', duration: 3 },
      [OrderStatusEnum.ASSIGNED_TO_DRIVER]: { icon: '👤', type: 'success', duration: 4 },
      [OrderStatusEnum.FULLY_PAID]: { icon: '💳', type: 'success', duration: 4 },
      [OrderStatusEnum.PICKING_UP]: { icon: '🚛', type: 'success', duration: 5 },
      [OrderStatusEnum.ON_DELIVERED]: { icon: '🚚', type: 'success', duration: 5 },
      [OrderStatusEnum.ONGOING_DELIVERED]: { icon: '📍', type: 'success', duration: 5 },
      [OrderStatusEnum.DELIVERED]: { icon: '✅', type: 'success', duration: 5 },
      [OrderStatusEnum.IN_TROUBLES]: { icon: '⚠️', type: 'error', duration: 8 },
      [OrderStatusEnum.RESOLVED]: { icon: '🔧', type: 'success', duration: 5 },
      [OrderStatusEnum.COMPENSATION]: { icon: '💰', type: 'warning', duration: 6 },
      [OrderStatusEnum.SUCCESSFUL]: { icon: '🎉', type: 'success', duration: 5 },
      [OrderStatusEnum.REJECT_ORDER]: { icon: '❌', type: 'error', duration: 6 },
      [OrderStatusEnum.RETURNING]: { icon: '↩️', type: 'warning', duration: 5 },
      [OrderStatusEnum.RETURNED]: { icon: '📦', type: 'info', duration: 4 },
    };
    return statusNotificationMap[status] || { icon: 'ℹ️', type: 'info', duration: 3 };
  };

  // Handle order status changes via WebSocket
  const handleOrderStatusChange = useCallback((statusChange: any) => {
    console.log('[CustomerOrderDetail] 📢 Order status changed:', statusChange);
    
    // Check if this status change is for the current order
    if (id && statusChange.orderId === id) {
      console.log('[CustomerOrderDetail] ✅ Order ID matched!');
      
      const notification = getStatusNotification(statusChange.newStatus);
      const statusLabel = OrderStatusLabels[statusChange.newStatus as OrderStatusEnum] || statusChange.newStatus;
      const notificationContent = `${notification.icon} ${statusChange.message || statusLabel}`;
      
      // Show notification based on status type
      if (notification.type === 'success') {
        message.success({
          content: notificationContent,
          duration: notification.duration,
        });
      } else if (notification.type === 'error') {
        message.error({
          content: notificationContent,
          duration: notification.duration,
        });
      } else if (notification.type === 'warning') {
        message.warning({
          content: notificationContent,
          duration: notification.duration,
        });
      } else {
        message.info({
          content: notificationContent,
          duration: notification.duration,
        });
      }
      
      playImportantNotificationSound();
      
      // Auto-switch to "Chi tiết vận chuyển" tab for delivery-related statuses
      if ([OrderStatusEnum.PICKING_UP, OrderStatusEnum.ON_DELIVERED, OrderStatusEnum.ONGOING_DELIVERED].includes(statusChange.newStatus)) {
        setTimeout(() => {
          setActiveMainTab('details');
        }, 1000);
      }
    } else {
      console.log('[CustomerOrderDetail] ❌ Order ID did not match:', {
        statusChangeOrderId: statusChange.orderId,
        currentOrderId: id
      });
    }
  }, [id]);

  // Handle refresh when order status changes
  const handleRefreshNeeded = useCallback(() => {
    if (id) {
      console.log('[CustomerOrderDetail] 🔄 Refreshing order details due to status change...');
      fetchOrderDetails(id);
    }
  }, [id]);

  // Subscribe to order status changes
  useOrderStatusTracking({
    orderId: id,
    autoConnect: true,
    onStatusChange: handleOrderStatusChange,
    onRefreshNeeded: handleRefreshNeeded,
  });

  useEffect(() => {
    // Scroll to top when entering order detail page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

  // Track order status changes for logging
  useEffect(() => {
    if (orderData?.order?.status) {
      if (previousOrderStatus && previousOrderStatus !== orderData.order.status) {
        console.log('[CustomerOrderDetail] Order status changed:', {
          from: previousOrderStatus,
          to: orderData.order.status
        });
      }
      setPreviousOrderStatus(orderData.order.status);
    }
  }, [orderData?.order?.status, previousOrderStatus]);

  const fetchOrderDetails = async (orderId: string) => {
    setLoading(true);
    try {
      const data = await orderService.getOrderForCustomerByOrderId(orderId);
      setOrderData(data);
      checkContractExists(orderId);
    } catch (error) {
      messageApi.error("Không thể tải thông tin đơn hàng");
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkContractExists = async (orderId: string) => {
    setCheckingContract(true);
    try {
      const response = await orderService.checkContractByOrderId(orderId);
      setHasContract(response.success && response.data !== null);
    } catch (error) {
      console.error("Error checking contract:", error);
      setHasContract(false);
    } finally {
      setCheckingContract(false);
    }
  };

  const fetchVehicleSuggestions = async () => {
    if (!id) return;

    setLoadingVehicleSuggestions(true);
    try {
      const response =
        await orderService.getBothOptimalAndRealisticAssignVehicles(id);
      setVehicleSuggestions(response.data.realistic);
      setVehicleSuggestionsModalVisible(true);
    } catch (error) {
      messageApi.error("Không thể tải đề xuất phân xe");
      console.error("Error fetching vehicle suggestions:", error);
    } finally {
      setLoadingVehicleSuggestions(false);
    }
  };

  const handleAcceptVehicleSuggestion = async () => {
    if (!id) return;

    setCreatingContract(true);
    try {
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 19);

      const contractData = {
        contractName: "N/A",
        effectiveDate: formattedDate,
        expirationDate: formattedDate,
        adjustedValue: 0,
        description: "N/A",
        attachFileUrl: "N/A",
        orderId: id,
      };

      const response = await contractService.createContract(contractData);

      if (response.success) {
        messageApi.success(
          response.message || "Đã đồng ý với đề xuất phân xe thành công!"
        );
        setVehicleSuggestionsModalVisible(false);
        setHasContract(true);
        fetchOrderDetails(id);
      } else {
        throw new Error(response.message || "Failed to create contract");
      }
    } catch (error) {
      messageApi.error("Không thể tạo hợp đồng. Vui lòng thử lại!");
      console.error("Error creating contract:", error);
    } finally {
      setCreatingContract(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa có thông tin";
    return dayjs(dateString)
      .tz("Asia/Ho_Chi_Minh")
      .format("DD/MM/YYYY HH:mm:ss");
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "orange",
      PROCESSING: "blue",
      CANCELLED: "red",
      DELIVERED: "green",
      SUCCESSFUL: "green",
      IN_TROUBLES: "red",
      // Add more status mappings as needed
    };
    return statusMap[status] || "default";
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/orders")}
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
        <div className="mb-6 flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/orders")}
            className="mr-4"
          >
            Quay lại
          </Button>
          <Title level={3}>Chi tiết đơn hàng</Title>
        </div>
        <Empty
          description="Không tìm thấy thông tin đơn hàng"
          className="bg-white p-8 rounded-xl shadow-md"
        />
      </div>
    );
  }

  const { order, contract, transactions } = orderData;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/orders")}
          className="mr-4"
        >
          Quay lại
        </Button>
        <Title level={3}>Chi tiết đơn hàng {order.orderCode}</Title>
      </div>

      <Card className="mb-6 shadow-md rounded-xl">
        <Tabs
          activeKey={activeMainTab}
          onChange={setActiveMainTab}
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
            <BasicInfoTab
              order={order}
              hasContract={hasContract}
              checkingContract={checkingContract}
              loadingVehicleSuggestions={loadingVehicleSuggestions}
              onFetchVehicleSuggestions={fetchVehicleSuggestions}
            />
          </TabPane>
          <TabPane
            tab={
              <span className="px-2 py-1">
                <CarOutlined className="mr-2" /> Chi tiết vận chuyển
              </span>
            }
            key="details"
          >
            <OrderDetailsTab
              order={order}
              activeDetailTab={activeDetailTab}
              onTabChange={setActiveDetailTab}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
            />
          </TabPane>
          <TabPane
            tab={
              <span className="px-2 py-1">
                <ProfileOutlined className="mr-2" /> Hợp đồng & Thanh toán
              </span>
            }
            key="contract"
          >
            <div>
              {/* Contract Information */}
              <ContractSection 
                contract={contract} 
                orderStatus={order.status} 
                depositAmount={order.depositAmount}
              />

              {/* Transaction Information */}
              <TransactionSection transactions={transactions} />
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal Suggest Contract Rule */}
      <VehicleSuggestionsModal
        visible={vehicleSuggestionsModalVisible}
        orderCode={order.orderCode}
        vehicleSuggestions={vehicleSuggestions}
        creatingContract={creatingContract}
        onCancel={() => setVehicleSuggestionsModalVisible(false)}
        onAccept={handleAcceptVehicleSuggestion}
      />
    </div>
  );
};

export default CustomerOrderDetail;
