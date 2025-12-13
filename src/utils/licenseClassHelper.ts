import { LicenseClassEnum } from '@/constants/enums';

/**
 * Vehicle types in the system with Vietnamese labels
 */
export interface VehicleTypeInfo {
    code: string;
    label: string;
    weightLimit: string;
}

/**
 * All vehicle types in the system
 */
export const VEHICLE_TYPES: VehicleTypeInfo[] = [
    { code: 'TRUCK_0_5_TON', label: 'Xe tải 0.5 tấn', weightLimit: '0.5 tấn' },
    { code: 'TRUCK_1_25_TON', label: 'Xe tải 1.25 tấn', weightLimit: '1.25 tấn' },
    { code: 'TRUCK_1_9_TON', label: 'Xe tải 1.9 tấn', weightLimit: '1.9 tấn' },
    { code: 'TRUCK_2_4_TONN', label: 'Xe tải 2.4 tấn', weightLimit: '2.4 tấn' },
    { code: 'TRUCK_3_5_TON', label: 'Xe tải 3.5 tấn', weightLimit: '3.5 tấn' },
    { code: 'TRUCK_5_TON', label: 'Xe tải 5 tấn', weightLimit: '5 tấn' },
    { code: 'TRUCK_7_TON', label: 'Xe tải 7 tấn', weightLimit: '7 tấn' },
    { code: 'TRUCK_10_TON', label: 'Xe tải 10 tấn', weightLimit: '10 tấn' },
];

/**
 * Get allowed vehicle types based on driver's license class
 * B2: Xe tải từ 3.5 tấn trở xuống (yêu cầu 18 tuổi trở lên)
 * C: Tất cả các loại xe (yêu cầu 24 tuổi trở lên)
 */
export function getAllowedVehicleTypes(licenseClass: string): VehicleTypeInfo[] {
    if (!licenseClass) return [];

    const normalizedClass = licenseClass.toUpperCase();

    switch (normalizedClass) {
        case LicenseClassEnum.B2:
            // B2: Xe tải từ 3.5 tấn trở xuống (yêu cầu 18 tuổi trở lên)
            return VEHICLE_TYPES.filter(vt => 
                ['TRUCK_0_5_TON', 'TRUCK_1_25_TON', 'TRUCK_1_9_TON', 'TRUCK_2_4_TONN', 'TRUCK_3_5_TON'].includes(vt.code)
            );
        case LicenseClassEnum.C:
            // C: Tất cả các loại xe (yêu cầu 24 tuổi trở lên)
            return VEHICLE_TYPES;
        default:
            return [];
    }
}

/**
 * Get license class description
 */
export function getLicenseClassDescription(licenseClass: string): string {
    if (!licenseClass) return 'Không xác định';

    const normalizedClass = licenseClass.toUpperCase();

    switch (normalizedClass) {
        case LicenseClassEnum.B2:
            return 'Xe tải từ 3.5 tấn trở xuống (yêu cầu 18 tuổi trở lên)';
        case LicenseClassEnum.C:
            return 'Tất cả các loại xe tải (yêu cầu 24 tuổi trở lên)';
        default:
            return 'Không xác định';
    }
}

/**
 * Get minimum age requirement for license class
 */
export function getMinAgeForLicenseClass(licenseClass: string): number {
    const normalizedClass = licenseClass?.toUpperCase();
    switch (normalizedClass) {
        case LicenseClassEnum.B2:
            return 18;
        case LicenseClassEnum.C:
            return 24;
        default:
            return 18;
    }
}

/**
 * Check if driver's license is expired
 */
export function isLicenseExpired(dateOfExpiry: string): boolean {
    if (!dateOfExpiry) return false;
    const expiryDate = new Date(dateOfExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiryDate < today;
}

/**
 * Get days until license expiry
 * Returns negative number if already expired
 */
export function getDaysUntilExpiry(dateOfExpiry: string): number {
    if (!dateOfExpiry) return 0;
    const expiryDate = new Date(dateOfExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * License expiry warning levels
 */
export type LicenseExpiryWarningLevel = 'expired' | 'critical' | 'warning' | 'none';

/**
 * Get license expiry warning level
 * - expired: Already expired
 * - critical: Less than 7 days (1 week) - RED
 * - warning: Less than 60 days (2 months) - YELLOW
 * - none: More than 60 days
 */
export function getLicenseExpiryWarningLevel(dateOfExpiry: string): LicenseExpiryWarningLevel {
    const daysUntilExpiry = getDaysUntilExpiry(dateOfExpiry);
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 7) return 'critical';
    if (daysUntilExpiry <= 60) return 'warning';
    return 'none';
}

/**
 * Get warning message based on expiry level
 */
export function getLicenseExpiryWarningMessage(dateOfExpiry: string): string | null {
    const level = getLicenseExpiryWarningLevel(dateOfExpiry);
    const daysUntilExpiry = getDaysUntilExpiry(dateOfExpiry);

    switch (level) {
        case 'expired':
            return `Bằng lái đã hết hạn ${Math.abs(daysUntilExpiry)} ngày`;
        case 'critical':
            return `Bằng lái sẽ hết hạn trong ${daysUntilExpiry} ngày`;
        case 'warning':
            return `Bằng lái sẽ hết hạn trong ${daysUntilExpiry} ngày`;
        default:
            return null;
    }
}
