import React from 'react';
import { Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

interface MapControlsProps {
    showControlPanel: boolean;
    setShowControlPanel: (show: boolean) => void;
    isNavigating: boolean;
    isSimulating: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
    showControlPanel,
    setShowControlPanel,
    isNavigating,
    isSimulating
}) => {
    return (
        <>
            {/* Nút hiển thị/ẩn panel điều khiển khi đang trong chế độ dẫn đường */}
            {(isNavigating || isSimulating) && !showControlPanel && (
                <Button
                    className="absolute top-4 left-4 z-20"
                    icon={<MenuOutlined />}
                    onClick={() => setShowControlPanel(true)}
                    type="primary"
                />
            )}
        </>
    );
};

export default MapControls; 