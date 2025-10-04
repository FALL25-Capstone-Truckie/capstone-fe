import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, Empty } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import VietMapMap from '../../../../components/common/VietMapMap';
import type { MapLocation } from '@/models/Map';
import type { RouteSegment } from '@/models/RoutePoint';

const { Title } = Typography;

interface RouteMapSectionProps {
    journeySegments: any[];
}

const RouteMapSection: React.FC<RouteMapSectionProps> = ({ journeySegments }) => {
    const [mapLocation, setMapLocation] = useState<MapLocation | null>(null);
    const [markers, setMarkers] = useState<MapLocation[]>([]);
    const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
    const [hasValidRoute, setHasValidRoute] = useState<boolean>(false);
    const mapRef = useRef<any>(null);

    // Custom function to get map instance
    const handleMapInstance = (map: any) => {
        mapRef.current = map;

        // Apply closer zoom when map is loaded
        if (map && markers.length > 1) {
            setTimeout(() => {
                try {
                    // Create bounds for all markers
                    const bounds = new window.vietmapgl.LngLatBounds();
                    markers.forEach(marker => {
                        bounds.extend([marker.lng, marker.lat]);
                    });

                    // Fit map to bounds with balanced padding for better context
                    map.fitBounds(bounds, {
                        padding: 80, // Moderate padding for context
                        maxZoom: undefined // Let the map determine the optimal zoom level
                    });

                    // No additional zoom step needed - we want a balanced view
                } catch (error) {
                    console.error("Error adjusting map zoom:", error);
                }
            }, 300);
        }
    };

    useEffect(() => {
        if (journeySegments && journeySegments.length > 0) {
            // Process journey segments to create markers and route segments
            const newMarkers: MapLocation[] = [];
            const newRouteSegments: RouteSegment[] = [];
            let validRouteFound = false;

            journeySegments.forEach((segment) => {
                if (!segment || !segment.pathCoordinatesJson) return;

                try {
                    // Parse path coordinates from JSON string
                    const pathCoordinates = JSON.parse(segment.pathCoordinatesJson);

                    if (!Array.isArray(pathCoordinates) || pathCoordinates.length === 0) {
                        console.error('Invalid path coordinates format:', pathCoordinates);
                        return;
                    }

                    // Add pickup point marker
                    if (segment.startLatitude && segment.startLongitude) {
                        newMarkers.push({
                            lat: segment.startLatitude,
                            lng: segment.startLongitude,
                            address: segment.startPointName || 'Điểm đầu',
                            name: segment.startPointName || 'Điểm đầu',
                            type: segment.startPointName?.toLowerCase().includes('pickup') ? 'pickup' : 'stopover',
                        });
                    }

                    // Add delivery point marker
                    if (segment.endLatitude && segment.endLongitude) {
                        newMarkers.push({
                            lat: segment.endLatitude,
                            lng: segment.endLongitude,
                            address: segment.endPointName || 'Điểm cuối',
                            name: segment.endPointName || 'Điểm cuối',
                            type: segment.endPointName?.toLowerCase().includes('delivery') ? 'delivery' : 'stopover',
                        });
                    }

                    // Create route segment
                    newRouteSegments.push({
                        segmentOrder: segment.segmentOrder || 0,
                        startName: segment.startPointName || 'Điểm đầu',
                        endName: segment.endPointName || 'Điểm cuối',
                        path: pathCoordinates,
                        tolls: [],
                        distance: (segment.distanceMeters || 0) / 1000, // Convert to kilometers
                        rawResponse: {},
                    });

                    validRouteFound = true;
                } catch (error) {
                    console.error('Error processing journey segment:', error);
                }
            });

            // Set the map center to the first point if we have valid markers
            if (newMarkers.length > 0) {
                setMapLocation(newMarkers[0]);
            }

            // Update state
            setMarkers(newMarkers);
            setRouteSegments(newRouteSegments);
            setHasValidRoute(validRouteFound);

            // Apply zoom to existing map if available
            if (mapRef.current && newMarkers.length > 1) {
                setTimeout(() => {
                    try {
                        // Create bounds for all markers
                        const bounds = new window.vietmapgl.LngLatBounds();
                        newMarkers.forEach(marker => {
                            bounds.extend([marker.lng, marker.lat]);
                        });

                        // Fit map to bounds with balanced padding for better context
                        mapRef.current.fitBounds(bounds, {
                            padding: 80, // Moderate padding for context
                            maxZoom: undefined // Let the map determine the optimal zoom level
                        });
                    } catch (error) {
                        console.error("Error adjusting map zoom:", error);
                    }
                }, 300);
            } else {
                setHasValidRoute(false);
            }
        }
    }, [journeySegments]);

    if (!journeySegments || journeySegments.length === 0 || !hasValidRoute) {
        return (
            <Card className="mb-6 shadow-md rounded-xl">
                <Title level={5} className="mb-4 flex items-center">
                    <EnvironmentOutlined className="mr-2 text-blue-500" />
                    Lộ trình vận chuyển
                </Title>
                <Empty description="Không có thông tin lộ trình" />
            </Card>
        );
    }

    return (
        <Card className="mb-6 shadow-md rounded-xl">
            <Title level={5} className="mb-4 flex items-center">
                <EnvironmentOutlined className="mr-2 text-blue-500" />
                Lộ trình vận chuyển
            </Title>
            <div className="h-[500px]">
                <VietMapMap
                    mapLocation={mapLocation}
                    onLocationChange={(location) => setMapLocation(location)}
                    markers={markers}
                    showRouteLines={true}
                    routeSegments={routeSegments}
                    animateRoute={false}
                    getMapInstance={handleMapInstance}
                />
            </div>
        </Card>
    );
};

export default RouteMapSection; 