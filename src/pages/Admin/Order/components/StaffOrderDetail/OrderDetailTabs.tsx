import React, { useState } from "react";
import { Empty, Tabs } from "antd";
import { BoxPlotOutlined } from "@ant-design/icons";
import type { StaffOrderDetailItem } from "../../../../../models/Order";
import AdditionalNavTabs from "./AdditionalNavTabs";
import OrderLiveTrackingMap from "./OrderLiveTrackingOnly";
import VehicleAssignmentSection from "./VehicleAssignmentSection";
import { OrderStatusEnum } from "../../../../../constants/enums";

// Import missing components that need to be created
import OrderDetailPackageTab from "./OrderDetailPackageTab";

// STABLE CONSTANTS - prevent re-renders
const REAL_TIME_TRACKING_STATUSES = [
    OrderStatusEnum.PICKING_UP,
    OrderStatusEnum.ON_DELIVERED,
    OrderStatusEnum.ONGOING_DELIVERED,
    OrderStatusEnum.DELIVERED,
    OrderStatusEnum.IN_TROUBLES,
    OrderStatusEnum.RESOLVED,
    OrderStatusEnum.COMPENSATION,
    OrderStatusEnum.SUCCESSFUL,
    OrderStatusEnum.RETURNING,
    OrderStatusEnum.RETURNED
];

const { TabPane } = Tabs;

interface OrderDetailTabsProps {
    order: any;
    formatDate: (dateString?: string) => string;
    setVehicleAssignmentModalVisible: (visible: boolean) => void;
}

const OrderDetailTabs: React.FC<OrderDetailTabsProps> = ({
    order,
    formatDate,
    setVehicleAssignmentModalVisible,
}) => {
    const [activeDetailTab, setActiveDetailTab] = useState<string>("0");
    const liveTrackingRef = React.useRef<HTMLDivElement>(null);

    // Memoize shouldShowRealTimeTracking to prevent unnecessary re-renders of OrderLiveTrackingOnly
    const shouldShowRealTimeTracking = React.useMemo(
        () => REAL_TIME_TRACKING_STATUSES.includes(order.status as OrderStatusEnum),
        [order.status]
    );

    // Auto switch to vehicle assignment tab and scroll when order has live tracking
    React.useEffect(() => {
        if (
            REAL_TIME_TRACKING_STATUSES.includes(order.status as OrderStatusEnum) &&
            order.vehicleAssignments &&
            order.vehicleAssignments.length > 0
        ) {
            // Delay to ensure component is fully rendered
            setTimeout(() => {
                liveTrackingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [order.status]); // Re-run when order status changes

    if (!order.orderDetails || order.orderDetails.length === 0) {
        return <Empty description="Không có thông tin chi tiết vận chuyển" />;
    }

    // Kiểm tra xem có vehicle assignment không
    const hasVehicleAssignment = order.vehicleAssignments && order.vehicleAssignments.length > 0;

    // Nếu có vehicle assignment, hiển thị theo vehicle assignment
    if (hasVehicleAssignment) {
        const getStatusColor = (status: string) => {
            switch (status) {
                case "PENDING":
                    return "orange";
                case "PROCESSING":
                case "IN_PROGRESS":
                    return "blue";
                case "DELIVERED":
                case "SUCCESSFUL":
                case "COMPLETED":
                    return "green";
                case "CANCELLED":
                case "IN_TROUBLES":
                    return "red";
                default:
                    return "default";
            }
        };

        return (
            <>
                {/* Live Tracking Map cho toàn bộ ORDER */}
                <div ref={liveTrackingRef} key={`map-${order.id}`}>
                    <OrderLiveTrackingMap
                        key={`tracking-${order.id}`}
                        orderId={order.id}
                        shouldShowRealTimeTracking={shouldShowRealTimeTracking}
                        vehicleAssignments={order.vehicleAssignments}
                    />
                </div>

                {/* Gộp thông tin chuyến xe + các tab chi tiết */}
                <VehicleAssignmentSection
                    vehicleAssignments={order.vehicleAssignments}
                    orderDetails={order.orderDetails}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                />
            </>
        );
    }

    // Nếu chưa phân công, hiển thị theo từng order detail như cũ
    return (
        <>
            <Tabs
                activeKey={activeDetailTab}
                onChange={setActiveDetailTab}
                type="card"
                className="order-detail-tabs"
            >
                {order.orderDetails.map((detail: StaffOrderDetailItem, index: number) => (
                    <TabPane
                        tab={
                            <span>
                                <BoxPlotOutlined /> Kiện {index + 1}{" "}
                                {detail.trackingCode ? `- ${detail.trackingCode} ` : ""}
                            </span>
                        }
                        key={index.toString()}
                    >
                        <OrderDetailPackageTab
                            detail={detail}
                            formatDate={formatDate}
                            setVehicleAssignmentModalVisible={setVehicleAssignmentModalVisible}
                            order={order}
                        />
                    </TabPane>
                ))}
            </Tabs>

            {/* Hiển thị AdditionalNavTabs */}
            <AdditionalNavTabs
                orderData={{
                    order: order,
                }}
                formatDate={formatDate}
            />
        </>
    );
};

export default React.memo(OrderDetailTabs, (prevProps, nextProps) => {
    // Return TRUE to SKIP re-render, FALSE to DO re-render
    if (prevProps.order?.id !== nextProps.order?.id) return false;
    if (prevProps.order?.status !== nextProps.order?.status) return false;
    if (prevProps.order?.vehicleAssignments?.length !== nextProps.order?.vehicleAssignments?.length) return false;
    
    // All checks passed - props are the same, SKIP re-render
    return true;
}); 