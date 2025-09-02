/**
 * Common types used across the application
 */

export interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

export interface ButtonProps {
    label: string;
    onClick: () => void;
    type?: 'primary' | 'secondary' | 'danger';
} 