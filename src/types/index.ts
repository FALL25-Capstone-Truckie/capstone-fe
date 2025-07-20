// Common interfaces used across the application

// User related types
export interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'customer' | 'driver';
}

// Route related types
export interface Route {
    id: string;
    startLocation: string;
    endLocation: string;
    distance: number;
    estimatedTime: number;
}

// Order related types
export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    origin: string;
    destination: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    createdAt: string;
}

// Component props types
export interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

export interface ButtonProps {
    label: string;
    onClick: () => void;
    type?: 'primary' | 'secondary' | 'danger';
} 