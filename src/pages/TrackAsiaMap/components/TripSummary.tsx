import React from 'react';
import { Card, Typography, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { formatTime, formatDistance } from '../../../services/trackasia.service';

const { Title } = Typography;

interface TripSummaryProps {
    tripSummary: {
        startTime: number | null;
        endTime: number | null;
        totalDistance: number;
        totalTime: number;
        averageSpeed: number;
    };
    onClose: () => void;
    routeInfo: any;
}

const TripSummary: React.FC<TripSummaryProps> = ({ tripSummary, onClose, routeInfo }) => {
    if (!tripSummary.startTime || !tripSummary.endTime || !routeInfo) return null;

    const actualDuration = (tripSummary.endTime - tripSummary.startTime) / 1000; // Thời gian thực tế (giây)
    const estimatedDuration = tripSummary.totalTime; // Thời gian ước tính (giây)
    const durationDiff = Math.abs(actualDuration - estimatedDuration);
    const durationDiffPercent = Math.round((durationDiff / estimatedDuration) * 100);

    const startTimeFormatted = new Date(tripSummary.startTime).toLocaleTimeString();
    const endTimeFormatted = new Date(tripSummary.endTime).toLocaleTimeString();

    return (
        <Card className="absolute bottom-4 left-4 right-4 z-20 bg-white shadow-lg max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
                <Title level={4} className="m-0">Tổng kết hành trình</Title>
                <Button type="text" icon={<CloseCircleOutlined />} onClick={onClose} />
            </div>

            <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-gray-500">Bắt đầu</div>
                            <div className="font-medium">{startTimeFormatted}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">Kết thúc</div>
                            <div className="font-medium">{endTimeFormatted}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">Quãng đường</div>
                            <div className="font-medium">{formatDistance(tripSummary.totalDistance)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">Thời gian di chuyển</div>
                            <div className="font-medium">{formatTime(actualDuration)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">Thời gian ước tính</div>
                            <div className="font-medium">{formatTime(estimatedDuration)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">Tốc độ trung bình</div>
                            <div className="font-medium">{Math.round(tripSummary.averageSpeed * 10) / 10} km/h</div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <div className="text-sm text-gray-500 mb-2">
                        {actualDuration > estimatedDuration
                            ? `Chậm hơn ${durationDiffPercent}% so với dự kiến`
                            : `Nhanh hơn ${durationDiffPercent}% so với dự kiến`
                        }
                    </div>
                    <Button type="primary" onClick={onClose}>Đóng</Button>
                </div>
            </div>
        </Card>
    );
};

export default TripSummary; 