import React from 'react';
import { getOrderSizeLabel, getOrderSizeColor, getOrderSizeIcon } from '../../constants/enums';

interface OrderSizeBadgeProps {
    description: string;
    showIcon?: boolean;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

/**
 * OrderSizeBadge - Hiển thị badge kích thước kiện hàng với màu sắc và icon
 */
const OrderSizeBadge: React.FC<OrderSizeBadgeProps> = ({
    description,
    showIcon = true,
    size = 'medium',
    className = '',
}) => {
    const label = getOrderSizeLabel(description);
    const colors = getOrderSizeColor(description);
    const icon = getOrderSizeIcon(description);

    const sizeClasses = {
        small: 'px-2 py-0.5 text-xs',
        medium: 'px-3 py-1 text-sm',
        large: 'px-4 py-1.5 text-base',
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5 rounded-full font-medium border
                ${colors.bg} ${colors.text} ${colors.border}
                ${sizeClasses[size]}
                ${className}
            `}
        >
            {showIcon && <span>{icon}</span>}
            <span>{label}</span>
        </span>
    );
};

export default OrderSizeBadge;
