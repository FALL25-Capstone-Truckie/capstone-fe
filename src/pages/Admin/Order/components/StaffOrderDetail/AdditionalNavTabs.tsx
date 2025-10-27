import React from "react";
import { Card, Tabs, Tag, Empty, Image } from "antd";
import {
    BoxPlotOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    WarningOutlined,
    FileTextOutlined,
    FireOutlined,
    CameraOutlined,
    NumberOutlined,
    ColumnWidthOutlined,
    DashboardOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import RouteMapWithRealTimeTracking from "./RouteMapWithRealTimeTracking";
import { OrderStatusEnum } from "../../../../../constants/enums";
import type { StaffOrderDetail, StaffOrderDetailItem } from "../../../../../models/Order";
import { formatJourneyType, getJourneyStatusColor, formatSealStatus, getSealStatusColor } from "../../../../../models/JourneyHistory";

const { TabPane } = Tabs;

interface AdditionalNavTabsProps {
    orderData: {
        order: StaffOrderDetail;
        contract?: any;
        transactions?: any[];
    };
    formatDate: (dateString?: string) => string;
}

const AdditionalNavTabs: React.FC<AdditionalNavTabsProps> = ({
    orderData,
    formatDate,
}) => {
    const renderFuelValue = (rawValue: unknown, unit?: string) => {
        if (rawValue === null || rawValue === undefined) {
            return "Chưa có thông tin";
        }

        let value: unknown = rawValue;
        if (typeof rawValue === "object" && rawValue !== null && "value" in rawValue) {
            value = (rawValue as { value?: number | string | null }).value;
        }

        if (value === null || value === undefined || value === "") {
            return "Chưa có thông tin";
        }

        return unit ? `${value} ${unit}` : `${value}`;
    };

    if (!orderData || !orderData.order || orderData.order.status === OrderStatusEnum.ON_PLANNING) {
        return null;
    }

    return (
        <Card className="mt-4 shadow-md rounded-xl">
            <Tabs defaultActiveKey="routemap" type="card">
                <TabPane
                    tab={
                        <span>
                            <BoxPlotOutlined /> Danh sách lô hàng
                        </span>
                    }
                    key="packageList"
                >
                    {/* Package list content */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                                    <th className="px-4 py-3 text-left font-semibold">Mã theo dõi</th>
                                    <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                                    <th className="px-4 py-3 text-left font-semibold">Trọng lượng</th>
                                    <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderData.order.orderDetails.map((detail: StaffOrderDetailItem, detailIdx: number) => (
                                    <tr key={detail.id} className={detailIdx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                                        <td className="px-4 py-3 border-b border-gray-200">
                                            <div className="flex items-center font-medium text-gray-900">
                                                <NumberOutlined className="mr-2 text-green-500" />
                                                {detail.trackingCode || "Chưa có"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200">
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
                                        <td className="px-4 py-3 border-b border-gray-200">
                                            <div className="flex items-center text-gray-700">
                                                <ColumnWidthOutlined className="mr-2 text-green-500" />
                                                {detail.weightBaseUnit} {detail.unit}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200">
                                            <div className="flex items-center text-gray-700">
                                                <FileTextOutlined className="mr-2 text-green-500" />
                                                {detail.description || "Không có mô tả"}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabPane>

                {/* Tab lộ trình vận chuyển */}
                <TabPane
                    tab={
                        <span>
                            <EnvironmentOutlined /> Lộ trình vận chuyển
                        </span>
                    }
                    key="routemap"
                >
                    {orderData.order.vehicleAssignments && orderData.order.vehicleAssignments.some((va: any) =>
                        va.journeyHistories &&
                        va.journeyHistories.length > 0 &&
                        va.journeyHistories.some((journey: any) =>
                            journey.journeySegments && journey.journeySegments.length > 0
                        )
                    ) ? (
                        <div>
                            {orderData.order.vehicleAssignments
                                .filter((va: any) =>
                                    va.journeyHistories &&
                                    va.journeyHistories.length > 0 &&
                                    va.journeyHistories.some((journey: any) =>
                                        journey.journeySegments && journey.journeySegments.length > 0
                                    )
                                )
                                .map((va: any, idx: number) => (
                                    <div key={idx} className="mb-6">
                                        {va.journeyHistories.map((journey: any, journeyIdx: number) => {
                                            if (!journey.journeySegments || journey.journeySegments.length === 0) {
                                                return null;
                                            }
                                            // Check if order status allows real-time tracking
                                            const shouldShowRealTimeTracking = orderData.order?.status ? [
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
                                            ].includes(orderData.order.status as OrderStatusEnum) : false;

                                            return (
                                                <div key={journey.id || `journey-${journeyIdx}`} className="mb-4">
                                                    <RouteMapWithRealTimeTracking
                                                        journeySegments={journey.journeySegments}
                                                        journeyInfo={journey}
                                                        orderId={orderData.order.id}
                                                        shouldShowRealTimeTracking={shouldShowRealTimeTracking}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            }
                        </div>
                    ) : (
                        <Empty description="Không có thông tin lộ trình" />
                    )}
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
                    {orderData.order.vehicleAssignments && orderData.order.vehicleAssignments.some((va: any) =>
                        va.journeyHistories && va.journeyHistories.length > 0
                    ) ? (
                        <div>
                            {orderData.order.vehicleAssignments
                                .filter((va: any) =>
                                    va.journeyHistories && va.journeyHistories.length > 0
                                )
                                .map((va: any, idx: number) => (
                                    <div key={idx} className="mb-4">
                                        <h3 className="font-medium mb-2">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                                        <th className="px-4 py-3 text-left font-semibold">Thời gian bắt đầu</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Thời gian kết thúc</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Quãng đường</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Báo cáo sự cố</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {va.journeyHistories.map((journey: any, journeyIdx: number) => (
                                                        <tr key={journey.id} className={journeyIdx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                                                            <td className="px-4 py-3 border-b border-gray-200">
                                                                <div className="font-medium text-gray-900">{formatDate(journey.startTime || journey.createdAt)}</div>
                                                                {journey.journeyName && (
                                                                    <Tag color="blue" className="text-xs mt-1">{journey.journeyName}</Tag>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 border-b border-gray-200">
                                                                <div className="font-medium text-gray-900">{formatDate(journey.endTime || journey.modifiedAt)}</div>
                                                                {journey.journeyType && (
                                                                    <Tag color="green" className="text-xs mt-1">{formatJourneyType(journey.journeyType)}</Tag>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 border-b border-gray-200">
                                                                <Tag color={getJourneyStatusColor(journey.status)}>
                                                                    {journey.status}
                                                                </Tag>
                                                            </td>
                                                            <td className="px-4 py-3 border-b border-gray-200">
                                                                <div className="font-medium text-gray-900">{journey.totalDistance || 'N/A'} {journey.totalDistance ? 'km' : ''}</div>
                                                                {journey.totalTollCount !== undefined && (
                                                                    <Tag color="cyan" className="text-xs mt-1">{journey.totalTollCount} trạm thu phí</Tag>
                                                                )}
                                                                {journey.totalTollFee !== undefined && journey.totalTollFee > 0 && (
                                                                    <div className="mt-1">
                                                                        <Tag color="purple" className="text-xs">{journey.totalTollFee.toLocaleString('vi-VN')} VNĐ</Tag>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 border-b border-gray-200">
                                                                {journey.isReportedIncident ? (
                                                                    <Tag color="red">Có</Tag>
                                                                ) : (
                                                                    <Tag color="green">Không</Tag>
                                                                )}
                                                                {journey.reasonForReroute && (
                                                                    <div className="mt-1 text-xs text-gray-500">{journey.reasonForReroute}</div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
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
                    {orderData.order.vehicleAssignments && orderData.order.vehicleAssignments.some((va: any) =>
                        va.issues && va.issues.length > 0
                    ) ? (
                        <div className="p-2">
                            {orderData.order.vehicleAssignments
                                .filter((va: any) =>
                                    va.issues && va.issues.length > 0
                                )
                                .map((va: any, idx: number) => (
                                    <div key={idx} className="mb-4">
                                        <h3 className="font-medium mb-2">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                                        {va.issues.map((issueItem: any, issueIdx: number) => (
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
                                ))
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
                    {orderData.order.vehicleAssignments && orderData.order.vehicleAssignments.some((va: any) =>
                        va.penalties && va.penalties.length > 0
                    ) ? (
                        <div className="p-2">
                            {orderData.order.vehicleAssignments
                                .filter((va: any) =>
                                    va.penalties && va.penalties.length > 0
                                )
                                .map((va: any, idx: number) => (
                                    <div key={idx} className="mb-4">
                                        <h3 className="font-medium mb-2">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                                                        <th className="px-4 py-3 text-left font-semibold">Loại vi phạm</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Số tiền phạt</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Ngày vi phạm</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {va.penalties.map((penalty: any, penaltyIdx: number) => (
                                                        <tr key={penalty.id} className={penaltyIdx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                                                            <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-900">{penalty.violationType}</td>
                                                            <td className="px-4 py-3 border-b border-gray-200 text-gray-700">{penalty.violationDescription}</td>
                                                            <td className="px-4 py-3 border-b border-gray-200 font-semibold text-red-600">
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(penalty.penaltyAmount)}
                                                            </td>
                                                            <td className="px-4 py-3 border-b border-gray-200 text-gray-700">{formatDate(penalty.penaltyDate)}</td>
                                                            <td className="px-4 py-3 border-b border-gray-200">
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
                                    </div>
                                ))
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
                    {orderData.order.vehicleAssignments && orderData.order.vehicleAssignments.some((va: any) =>
                        va.seals && va.seals.length > 0
                    ) ? (
                        <div className="p-4">
                            {orderData.order.vehicleAssignments
                                .filter((va: any) =>
                                    va.seals && va.seals.length > 0
                                )
                                .map((va: any, idx: number) => (
                                    <div key={idx} className="mb-6">
                                        <h3 className="text-lg font-semibold mb-4 text-blue-600">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {va.seals.map((seal: any) => (
                                                <div key={seal.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-gray-600">Mã niêm phong</p>
                                                            <p className="text-base font-bold text-blue-600">{seal.sealCode || seal.sealId}</p>
                                                        </div>
                                                        <Tag color={getSealStatusColor(seal.status)} className="ml-2">
                                                            {formatSealStatus(seal.status)}
                                                        </Tag>
                                                    </div>

                                                    <div className="space-y-2 mb-3 pb-3 border-b border-blue-200">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Mô tả</p>
                                                            <p className="text-sm text-gray-700">{seal.description || "Không có mô tả"}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div>
                                                            <p className="text-gray-500">Ngày niêm phong</p>
                                                            <p className="font-medium text-gray-700">{seal.sealDate ? formatDate(seal.sealDate) : "Chưa có"}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Thời gian gỡ</p>
                                                            <p className="font-medium text-gray-700">{seal.sealRemovalTime ? formatDate(seal.sealRemovalTime) : "Chưa gỡ"}</p>
                                                        </div>
                                                    </div>

                                                    {seal.sealAttachedImage && (
                                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                                            <p className="text-xs text-gray-500 mb-2">Hình ảnh niêm phong</p>
                                                            <Image
                                                                src={seal.sealAttachedImage}
                                                                alt={`Seal ${seal.sealCode}`}
                                                                className="w-full h-24 object-cover rounded"
                                                                preview
                                                            />
                                                        </div>
                                                    )}

                                                    {seal.sealRemovalReason && (
                                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                                            <p className="text-xs text-gray-500">Lý do gỡ niêm phong</p>
                                                            <p className="text-sm text-red-600 font-medium">{seal.sealRemovalReason}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    ) : (
                        <Empty description="Không có thông tin niêm phong" />
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
                    {orderData.order.vehicleAssignments && orderData.order.vehicleAssignments.some((va: any) =>
                        va.fuelConsumption
                    ) ? (
                        <div className="p-2">
                            {orderData.order.vehicleAssignments
                                .filter((va: any) =>
                                    va.fuelConsumption
                                )
                                .map((va: any, idx: number) => {
                                    const fuel = va.fuelConsumption;
                                    return (
                                        <div key={idx} className="mb-4">
                                            <h3 className="font-medium mb-2">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="flex items-center">
                                                        <DashboardOutlined className="mr-2 text-gray-500" />
                                                        <span className="font-medium mr-1">Chỉ số đồng hồ khi nạp:</span>
                                                        <span>{renderFuelValue(fuel.odometerReadingAtStart, "km")}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <DashboardOutlined className="mr-2 text-gray-500" />
                                                        <span className="font-medium mr-1">Chỉ số đồng hồ khi kết thúc:</span>
                                                        <span>{renderFuelValue(fuel.odometerReadingAtEnd, "km")}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FireOutlined className="mr-2 text-gray-500" />
                                                        <span className="font-medium mr-1">Quãng đường:</span>
                                                        <span>{renderFuelValue(fuel.distanceTraveled, "km")}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <CalendarOutlined className="mr-2 text-gray-500" />
                                                        <span className="font-medium mr-1">Ngày ghi nhận:</span>
                                                        <span>{fuel.dateRecorded ? formatDate(fuel.dateRecorded) : "Chưa có thông tin"}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FireOutlined className="mr-2 text-gray-500" />
                                                        <span className="font-medium mr-1">Thể tích nhiên liệu:</span>
                                                        <span>{renderFuelValue(fuel.fuelVolume, "lít")}</span>
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

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                            width={200}
                                                            height={150}
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
                                                            width={200}
                                                            height={150}
                                                        />
                                                    </div>
                                                )}
                                                {fuel.companyInvoiceImageUrl && (
                                                    <div>
                                                        <div className="flex items-center mb-2">
                                                            <FileTextOutlined className="mr-2 text-blue-500" />
                                                            <span className="font-medium">Hóa đơn công ty</span>
                                                        </div>
                                                        <Image
                                                            src={fuel.companyInvoiceImageUrl}
                                                            alt="Company invoice"
                                                            className="object-cover rounded"
                                                            width={200}
                                                            height={150}
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
                    {orderData.order.vehicleAssignments && orderData.order.vehicleAssignments.some((va: any) =>
                        va.photoCompletions && va.photoCompletions.length > 0
                    ) ? (
                        <div className="p-2">
                            {orderData.order.vehicleAssignments
                                .filter((va: any) =>
                                    va.photoCompletions && va.photoCompletions.length > 0
                                )
                                .map((va: any, idx: number) => (
                                    <div key={idx} className="mb-4">
                                        <h3 className="font-medium mb-2">Chuyến xe #{idx + 1} - {va.vehicle?.licensePlateNumber || "Chưa có mã"}</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {va.photoCompletions.map(
                                                (url: string, photoIdx: number) => (
                                                    <div key={photoIdx} className="relative group">
                                                        <Image
                                                            src={url}
                                                            alt={`Completion photo ${photoIdx + 1}`}
                                                            className="object-cover rounded w-full h-32"
                                                            preview
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all" />
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    ) : (
                        <Empty description="Không có hình ảnh hoàn thành" />
                    )}
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default AdditionalNavTabs; 