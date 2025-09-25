import React, { useState } from "react";
import { Empty, Tabs, Card } from "antd";
import { BoxPlotOutlined, CarOutlined } from "@ant-design/icons";
import { OrderStatusEnum } from "../../../../../constants/enums";
import VehicleInfoSection from "./VehicleInfoSection";
import type { StaffOrderDetailItem } from "../../../../../models/Order";
import AdditionalNavTabs from "./AdditionalNavTabs";

// Import missing components that need to be created
import OrderDetailPackageTab from "./OrderDetailPackageTab";

const { TabPane } = Tabs;

interface VehicleAssignmentGroup {
    vehicleAssignment: any;
    orderDetails: StaffOrderDetailItem[];
}

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
        const vehicleAssignmentMap = new Map<string, VehicleAssignmentGroup>();

        order.orderDetails.forEach((detail: StaffOrderDetailItem) => {
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
            <>
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

export default OrderDetailTabs; 