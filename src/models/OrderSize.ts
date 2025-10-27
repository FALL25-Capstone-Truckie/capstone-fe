export interface OrderSize {
    id: string;
    name: string; // Thêm thuộc tính name
    price: number; // Thêm thuộc tính price
    minWeight: number;
    maxWeight: number;
    minLength: number;
    maxLength: number;
    minHeight: number;
    maxHeight: number;
    minWidth: number;
    maxWidth: number;
    status: string;
    description: string;
}

export interface OrderSizeCreateDto {
    name: string;
    description: string;
    minWeight: number;
    maxWeight: number;
    minLength: number;
    maxLength: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    price: number;
}

export interface OrderSizeUpdateDto {
    name?: string;
    description?: string;
    minWeight?: number;
    maxWeight?: number;
    minLength?: number;
    maxLength?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    price?: number;
    isActive?: boolean;
}