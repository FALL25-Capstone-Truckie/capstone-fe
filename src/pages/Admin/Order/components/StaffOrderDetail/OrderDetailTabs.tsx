import React, { useState } from "react";
import { Empty, Tabs, Card, Tag } from "antd";
import { BoxPlotOutlined, CarOutlined, UserOutlined, PhoneOutlined, TagOutlined } from "@ant-design/icons";
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

    // Kiểm tra xem có vehicle assignment không
    const hasVehicleAssignment = order.vehicleAssignments && order.vehicleAssignments.length > 0;

    // Nếu có vehicle assignment, hiển thị theo vehicle assignment
    if (hasVehicleAssignment) {
        const vehicleAssignmentMap = new Map<string, VehicleAssignmentGroup>();

        // Initialize map with vehicle assignments from order level
        order.vehicleAssignments.forEach((va: any) => {
            vehicleAssignmentMap.set(va.id, {
                vehicleAssignment: va,
                orderDetails: [],
            });
        });

        // Group order details by their vehicleAssignmentId
        order.orderDetails.forEach((detail: StaffOrderDetailItem) => {
            if (detail.vehicleAssignmentId) {
                const group = vehicleAssignmentMap.get(detail.vehicleAssignmentId);
                if (group) {
                    group.orderDetails.push(detail);
                }
            }
        });

        const vehicleAssignments = Array.from(vehicleAssignmentMap.values());

        if (vehicleAssignments.length === 0) {
            return <Empty description="Chưa có thông tin phân công xe" />;
        }

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
                            <Card
                                className="shadow-md mb-6 rounded-xl"
                                size="small"
                            >
                                <div className="p-2">
                                    <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center mb-3">
                                            <CarOutlined className="text-xl text-blue-500 mr-3" />
                                            <span className="text-lg font-medium">
                                                {vaGroup.vehicleAssignment.vehicle?.licensePlateNumber || "Chưa có thông tin"}
                                            </span>
                                            <Tag
                                                className="ml-3"
                                                color={getStatusColor(vaGroup.vehicleAssignment.status || "")}
                                            >
                                                {vaGroup.vehicleAssignment.status}
                                            </Tag>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex items-center">
                                                <TagOutlined className="mr-2 text-gray-500" />
                                                <span className="font-medium mr-1">Nhà sản xuất:</span>
                                                <span>
                                                    {vaGroup.vehicleAssignment.vehicle?.manufacturer || "Chưa có thông tin"}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <CarOutlined className="mr-2 text-gray-500" />
                                                <span className="font-medium mr-1">Mẫu xe:</span>
                                                <span>
                                                    {vaGroup.vehicleAssignment.vehicle?.model || "Chưa có thông tin"}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <TagOutlined className="mr-2 text-gray-500" />
                                                <span className="font-medium mr-1">Loại xe:</span>
                                                <span>
                                                    {vaGroup.vehicleAssignment.vehicle?.vehicleType || "Chưa có thông tin"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="flex items-center mb-2">
                                                <UserOutlined className="text-green-500 mr-2" />
                                                <span className="font-medium">Tài xế chính</span>
                                            </div>
                                            {vaGroup.vehicleAssignment.primaryDriver ? (
                                                <div className="ml-6">
                                                    <div className="flex items-center mb-1">
                                                        <UserOutlined className="mr-2 text-gray-500" />
                                                        <span>{vaGroup.vehicleAssignment.primaryDriver.fullName}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <PhoneOutlined className="mr-2 text-gray-500" />
                                                        <span>{vaGroup.vehicleAssignment.primaryDriver.phoneNumber}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="ml-6 text-gray-500">Chưa có thông tin</div>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="flex items-center mb-2">
                                                <UserOutlined className="text-blue-500 mr-2" />
                                                <span className="font-medium">Tài xế phụ</span>
                                            </div>
                                            {vaGroup.vehicleAssignment.secondaryDriver ? (
                                                <div className="ml-6">
                                                    <div className="flex items-center mb-1">
                                                        <UserOutlined className="mr-2 text-gray-500" />
                                                        <span>{vaGroup.vehicleAssignment.secondaryDriver.fullName}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <PhoneOutlined className="mr-2 text-gray-500" />
                                                        <span>{vaGroup.vehicleAssignment.secondaryDriver.phoneNumber}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="ml-6 text-gray-500">Chưa có thông tin</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Danh sách lô hàng sẽ được hiển thị ở AdditionalNavTabs */}

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