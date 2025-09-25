import React from "react";
import { Card, Tag, Tooltip } from "antd";
import { FileTextOutlined, CalendarOutlined, TagOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface OrderStatusSectionProps {
    orderCode: string;
    status: string;
    createdAt: string;
    totalPrice: number | null;
}

const OrderStatusSection: React.FC<OrderStatusSectionProps> = ({
    orderCode,
    status,
    createdAt,
    totalPrice,
}) => {
    const getStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            PENDING: "orange",
            PROCESSING: "blue",
            ON_PLANNING: "geekblue",
            ASSIGNED_TO_DRIVER: "cyan",
            IN_TRANSIT: "purple",
            CANCELLED: "red",
            DELIVERED: "green",
            SUCCESSFUL: "green",
            IN_TROUBLES: "red",
            // Add more status mappings as needed
        };
        return statusMap[status] || "default";
    };

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("DD/MM/YYYY HH:mm:ss");
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null || amount === undefined) {
            return "0 VND";
        }
        return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    return (
        <Card className="mb-6 shadow-md rounded-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                    <p className="text-gray-500 mb-1">Trạng thái đơn hàng</p>
                    <div className="flex items-center">
                        <Tag color={getStatusColor(status)} className="text-base px-3 py-1">
                            {status}
                        </Tag>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="text-center px-4">
                        <p className="text-gray-500 text-sm">Mã đơn hàng</p>
                        <Tooltip title={orderCode}>
                            <p className="font-semibold text-lg">{orderCode}</p>
                        </Tooltip>
                    </div>
                    <div className="text-center px-4 border-l border-gray-200">
                        <p className="text-gray-500 text-sm">Ngày tạo</p>
                        <Tooltip title={formatDate(createdAt)}>
                            <p className="font-semibold">{formatDate(createdAt)}</p>
                        </Tooltip>
                    </div>
                    <div className="text-center px-4 border-l border-gray-200">
                        <p className="text-gray-500 text-sm">Tổng tiền</p>
                        <p className="font-semibold text-lg text-blue-600">
                            {formatCurrency(totalPrice)}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default OrderStatusSection; 