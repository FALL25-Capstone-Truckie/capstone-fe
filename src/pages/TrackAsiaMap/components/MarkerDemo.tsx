import React from 'react';
import { Button, Space, Typography } from 'antd';
import { PushpinOutlined, DeleteOutlined } from '@ant-design/icons';
import trackasiagl from 'trackasia-gl';

const { Text } = Typography;

interface MarkerDemoProps {
    map: trackasiagl.Map | null;
}

const MarkerDemo: React.FC<MarkerDemoProps> = ({ map }) => {
    const [markers, setMarkers] = React.useState<trackasiagl.Marker[]>([]);

    const addRandomMarker = () => {
        if (!map) return;

        // Generate a random position within the current map bounds
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        const randomLng = sw.lng + Math.random() * (ne.lng - sw.lng);
        const randomLat = sw.lat + Math.random() * (ne.lat - sw.lat);

        // Create a random color for the marker
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        // Create a new marker
        const newMarker = new trackasiagl.Marker({
            color: randomColor,
            draggable: true
        })
            .setLngLat([randomLng, randomLat])
            .addTo(map);

        // Create a popup for the marker
        const popup = new trackasiagl.Popup({ offset: 25 })
            .setHTML(`<h3>Đánh dấu</h3><p>Tọa độ: ${randomLng.toFixed(4)}, ${randomLat.toFixed(4)}</p>`);

        // Attach the popup to the marker
        newMarker.setPopup(popup);

        // Add the marker to the state
        setMarkers(prev => [...prev, newMarker]);
    };

    const removeAllMarkers = () => {
        markers.forEach(marker => marker.remove());
        setMarkers([]);
    };

    return (
        <Space direction="vertical" className="w-full">
            <Text className="block mb-2">
                Thêm điểm đánh dấu ngẫu nhiên vào bản đồ hoặc xóa tất cả các điểm đánh dấu.
            </Text>
            <Space>
                <Button
                    type="primary"
                    icon={<PushpinOutlined />}
                    onClick={addRandomMarker}
                    disabled={!map}
                >
                    Thêm điểm đánh dấu
                </Button>
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={removeAllMarkers}
                    disabled={markers.length === 0}
                >
                    Xóa tất cả ({markers.length})
                </Button>
            </Space>
        </Space>
    );
};

export default MarkerDemo; 