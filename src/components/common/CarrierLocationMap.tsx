import React, { useState, useEffect } from 'react';
import { Card, Typography, Divider, Spin } from 'antd';
import VietMapSearch from './VietMapSearch';
import VietMapMap from './VietMapMap';
import { useVietMapSearch } from '../../hooks/useVietMapSearch';
import type { MapLocation } from '../../models/Map';
import type { VietMapAutocompleteResult } from '../../models/VietMap';

const { Title, Text } = Typography;

interface CarrierLocationMapProps {
    initialLatitude?: number;
    initialLongitude?: number;
    onLocationChange: (latitude: number, longitude: number, address?: string) => void;
}

const CarrierLocationMap: React.FC<CarrierLocationMapProps> = ({
    initialLatitude,
    initialLongitude,
    onLocationChange
}) => {
    const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
        initialLatitude && initialLongitude
            ? { lat: initialLatitude, lng: initialLongitude, address: '' }
            : null
    );
    const [searchAddress, setSearchAddress] = useState<string>('');
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

    const {
        results: searchResults,
        isSearching,
        searchPlaces,
        reverseGeocode
    } = useVietMapSearch();

    // Handle search
    const handleSearchChange = (text: string) => {
        setSearchAddress(text);
        searchPlaces(text);
    };

    // Handle location selection from search
    const handleSearchSelect = (result: VietMapAutocompleteResult) => {
        if (!result.lat || !result.lng) return;
        
        const newLocation: MapLocation = {
            lat: result.lat,
            lng: result.lng,
            address: result.display || result.name
        };
        setSelectedLocation(newLocation);
        setSearchAddress(result.display || result.name);
        onLocationChange(result.lat, result.lng, result.display);
    };

    // Handle map click with reverse geocoding
    const handleMapClick = async (location: MapLocation) => {
        setSelectedLocation(location);
        setIsReverseGeocoding(true);
        
        // Get address from reverse geocoding
        try {
            const geocodeResults = await reverseGeocode(location.lat, location.lng);
            if (geocodeResults && geocodeResults.length > 0) {
                const firstResult = geocodeResults[0];
                const address = firstResult.display || firstResult.address || '';
                
                setSelectedLocation({
                    ...location,
                    address: address
                });
                setSearchAddress(address);
                onLocationChange(location.lat, location.lng, address);
            } else {
                // Fallback if no geocoding results
                setSearchAddress(location.address || '');
                onLocationChange(location.lat, location.lng, location.address);
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            // Fallback on error
            setSearchAddress(location.address || '');
            onLocationChange(location.lat, location.lng, location.address);
        } finally {
            setIsReverseGeocoding(false);
        }
    };

    // Initialize with carrier coordinates
    useEffect(() => {
        if (initialLatitude && initialLongitude && !selectedLocation) {
            const initialLocation: MapLocation = {
                lat: initialLatitude,
                lng: initialLongitude,
                address: ''
            };
            setSelectedLocation(initialLocation);
        }
    }, [initialLatitude, initialLongitude]);

    return (
        <Card 
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Title level={5} style={{ margin: 0 }}>Vị trí công ty</Title>
                </div>
            }
            style={{ marginTop: 16 }}
        >
            <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                    Tìm kiếm địa chỉ hoặc nhấp vào bản đồ để chọn vị trí cho công ty vận chuyển
                </Text>
            </div>
            
            {/* Search Component */}
            <div style={{ marginBottom: 16 }}>
                <VietMapSearch
                    onSearch={handleSearchChange}
                    onSelect={handleSearchSelect}
                    results={searchResults}
                    loading={isSearching}
                    initialValue={searchAddress}
                />
            </div>

            <Divider />

            {/* Map Component */}
            <div style={{ height: '400px', width: '100%' }}>
                <VietMapMap
                    mapLocation={selectedLocation}
                    onLocationChange={handleMapClick}
                />
            </div>

            {/* Selected Location Info */}
            {selectedLocation && (
                <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                    <Text strong>Vị trí đã chọn:</Text>
                    <div style={{ marginTop: 4 }}>
                        <Text type="secondary">
                            Tọa độ: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </Text>
                    </div>
                    {isReverseGeocoding ? (
                        <div style={{ marginTop: 4 }}>
                            <Text type="secondary">
                                <Spin size="small" style={{ marginRight: 8 }} />
                                Đang lấy địa chỉ...
                            </Text>
                        </div>
                    ) : selectedLocation.address ? (
                        <div style={{ marginTop: 4 }}>
                            <Text type="secondary">Địa chỉ: {selectedLocation.address}</Text>
                        </div>
                    ) : null}
                </div>
            )}
        </Card>
    );
};

export default CarrierLocationMap;
