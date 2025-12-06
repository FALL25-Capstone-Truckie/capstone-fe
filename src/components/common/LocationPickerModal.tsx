import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import AddressMap from './AddressMap';
import type { MapLocation } from '../../models/Map';

interface LocationPickerModalProps {
    visible: boolean;
    onCancel: () => void;
    onLocationSelect: (latitude: number, longitude: number) => void;
    initialLatitude?: number;
    initialLongitude?: number;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
    visible,
    onCancel,
    onLocationSelect,
    initialLatitude,
    initialLongitude
}) => {
    const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
        initialLatitude && initialLongitude
            ? { lat: initialLatitude, lng: initialLongitude, address: '' }
            : null
    );

    const handleLocationChange = (location: MapLocation) => {
        setSelectedLocation(location);
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            onLocationSelect(selectedLocation.lat, selectedLocation.lng);
            onCancel();
        } else {
            message.warning('Vui lòng chọn vị trí trên bản đồ');
        }
    };

    return (
        <Modal
            title="Chọn vị trí trên bản đồ"
            open={visible}
            onCancel={onCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="confirm"
                    type="primary"
                    icon={<EnvironmentOutlined />}
                    onClick={handleConfirm}
                    disabled={!selectedLocation}
                >
                    Xác nhận vị trí
                </Button>
            ]}
        >
            <div style={{ marginBottom: 16 }}>
                <p style={{ margin: 0, color: '#666' }}>
                    Nhấp vào bản đồ để chọn vị trí cho công ty vận chuyển
                </p>
                {selectedLocation && (
                    <p style={{ margin: '8px 0 0 0', color: '#1890ff', fontSize: '12px' }}>
                        Vị trí đã chọn: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                )}
            </div>
            <AddressMap
                mapLocation={selectedLocation}
                onLocationChange={handleLocationChange}
            />
        </Modal>
    );
};

export default LocationPickerModal;
