import React from 'react';
import { Card, Statistic, Skeleton } from 'antd';
import type { StatisticProps } from 'antd';

export interface StatCardProps {
    title: string;
    value: number | string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    valueStyle?: React.CSSProperties;
    borderColor?: string;
    loading?: boolean;
    precision?: number;
    formatter?: StatisticProps['formatter'];
}

const CARD_MIN_HEIGHT = 100;

/**
 * StatCard - Reusable statistic card component with consistent styling
 * Used across Admin and Staff pages for displaying statistics
 */
const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    prefix,
    suffix,
    valueStyle,
    borderColor = '#1890ff',
    loading = false,
    precision,
    formatter
}) => {
    if (loading) {
        return (
            <Card 
                className="shadow-sm"
                style={{ borderTop: `4px solid ${borderColor}` }}
                bodyStyle={{ 
                    padding: '16px 20px', 
                    minHeight: CARD_MIN_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
        );
    }

    return (
        <Card 
            className="shadow-sm hover:shadow-md transition-shadow"
            style={{ borderTop: `4px solid ${borderColor}` }}
            bodyStyle={{ 
                padding: '16px 20px', 
                minHeight: CARD_MIN_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Statistic 
                title={title}
                value={value}
                prefix={prefix}
                suffix={suffix}
                valueStyle={{ 
                    fontSize: '24px',
                    fontWeight: 600,
                    ...valueStyle 
                }}
                precision={precision}
                formatter={formatter}
            />
        </Card>
    );
};

export default StatCard;
