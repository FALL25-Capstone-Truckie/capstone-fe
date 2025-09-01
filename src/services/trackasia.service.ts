import axios from 'axios';
import { TRACKASIA_MAP_API_KEY, TRACKASIA_MAP_API_BASE_URL } from '../config/env';

// Types for API responses
export interface GeocodingResult {
    id: string;
    type: string;
    place_type: string[];
    relevance: number;
    properties: {
        accuracy: string;
    };
    text: string;
    place_name: string;
    center: [number, number];
    geometry: {
        type: string;
        coordinates: [number, number];
    };
    context: Array<{
        id: string;
        text: string;
    }>;
}

export interface GeocodingResponse {
    type: string;
    query: string[];
    features: GeocodingResult[];
    attribution: string;
}

export interface DirectionsResponse {
    routes: Array<{
        weight_name: string;
        weight: number;
        duration: number;
        distance: number;
        legs: Array<{
            steps: Array<{
                maneuver: {
                    bearing_after: number;
                    bearing_before: number;
                    location: [number, number];
                    modifier?: string;
                    type: string;
                    instruction: string;
                };
                name: string;
                duration: number;
                distance: number;
                geometry: string;
            }>;
            summary: string;
            weight: number;
            duration: number;
            distance: number;
        }>;
        geometry: string;
    }>;
    waypoints: Array<{
        name: string;
        location: [number, number];
    }>;
    code: string;
    uuid: string;
}

// TrackAsia API v2 Response Types
export interface AutocompleteResult {
    place_id: string;
    reference: string;
    name: string;
    description: string;
    formatted_address: string;
    icon: string;
    matched_substrings: Array<{
        length: number;
        offset: number;
    }>;
    structured_formatting: {
        main_text: string;
        main_text_matched_substrings: Array<{
            length: number;
            offset: number;
        }>;
        secondary_text: string;
    };
    terms: Array<{
        offset: number;
        value: string;
    }>;
    types: string[];
    old_description?: string;
    old_formatted_address?: string;
}

export interface AutocompleteResponse {
    status: string;
    warning_message?: string;
    predictions: AutocompleteResult[];
}

export interface NearbySearchResult {
    place_id: string;
    name: string;
    formatted_address: string;
    adr_address: string;
    address_components: Array<{
        long_name: string;
        short_name: string;
        types: string[];
    }>;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
        location_type: string;
        viewport: {
            northeast: {
                lat: number;
                lng: number;
            };
            southwest: {
                lat: number;
                lng: number;
            };
        };
    };
    plus_code: {
        compound_code: string;
        global_code: string;
    };
    types: string[];
    icon: string;
    icon_background_color: string;
    url?: string;
    utc_offset?: number;
    vicinity?: string;
    old_address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
    }>;
    old_formatted_address?: string;
}

export interface NearbySearchResponse {
    status: string;
    html_attributions: string[];
    results: NearbySearchResult[];
}

export interface PlaceDetailsResult {
    place_id: string;
    name: string;
    formatted_address: string;
    vicinity?: string;
    adr_address?: string;
    editorial_summary?: {
        overview: string;
    };
    address_components: Array<{
        long_name: string;
        short_name: string;
        types: string[];
        official_id?: string;
    }>;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
        location_type: string;
        viewport: {
            northeast: {
                lat: number;
                lng: number;
            };
            southwest: {
                lat: number;
                lng: number;
            };
        };
    };
    plus_code: {
        compound_code: string;
        global_code: string;
    };
    types: string[];
    icon: string;
    icon_background_color: string;
    photos?: Array<{
        url: string;
    }>;
    opening_hours?: {
        open_now: boolean;
        periods: Array<{
            open: {
                day: number;
                time: string;
            };
            close: {
                day: number;
                time: string;
            };
        }>;
        weekday_text: string[];
    };
    rating?: number;
    user_ratings_total?: number;
    website?: string;
    phone_number?: string;
    socials?: string[];
    url?: string;
    utc_offset?: number;
    old_address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
    }>;
    old_formatted_address?: string;
}

export interface PlaceDetailsResponse {
    status: string;
    html_attributions: string[];
    result: PlaceDetailsResult;
}

// New TrackAsia API v2 Reverse Geocoding Response Types
export interface ReverseGeocodingAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

export interface ReverseGeocodingResult {
    place_id: string;
    name: string;
    sublabel?: string;
    formatted_address: string;
    address_components: ReverseGeocodingAddressComponent[];
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
        location_type: string;
        viewport: {
            northeast: {
                lat: number;
                lng: number;
            };
            southwest: {
                lat: number;
                lng: number;
            };
        };
    };
    plus_code: {
        compound_code: string;
        global_code: string;
    };
    partial_match?: boolean;
    icon: string;
    icon_background_color: string;
    class?: string;
    subclass?: string;
    types: string[];
    old_address_components?: ReverseGeocodingAddressComponent[];
    old_formatted_address?: string;
}

export interface ReverseGeocodingResponse {
    plus_code: {
        global_code: string;
        compound_code?: string;
    };
    status: string;
    results: ReverseGeocodingResult[];
}

// New TrackAsia API v2 Directions Response Types
export interface DirectionsStep {
    distance: {
        text: string;
        value: number;
    };
    duration: {
        text: string;
        value: number;
    };
    start_location: {
        lat: number;
        lng: number;
    };
    end_location: {
        lat: number;
        lng: number;
    };
    polyline: {
        points: string;
    };
    html_instructions: string;
    travel_mode: string;
    maneuver?: string;
}

export interface DirectionsLeg {
    distance: {
        text: string;
        value: number;
    };
    duration: {
        text: string;
        value: number;
    };
    start_address: string;
    end_address: string;
    start_location: {
        lat: number;
        lng: number;
    };
    end_location: {
        lat: number;
        lng: number;
    };
    steps: DirectionsStep[];
}

export interface DirectionsV2Route {
    summary: string;
    bounds: {
        northeast: {
            lat: number;
            lng: number;
        };
        southwest: {
            lat: number;
            lng: number;
        };
    };
    copyrights: string;
    legs: DirectionsLeg[];
    overview_polyline: {
        points: string;
    };
    waypoint_order: number[];
}

export interface DirectionsV2Response {
    routes: DirectionsV2Route[];
    status: string;
    geocoded_waypoints: Array<{
        geocoder_status: string;
        place_id: string;
        types: string[];
    }>;
}

/**
 * Get directions between two points
 * @param startLng Start longitude
 * @param startLat Start latitude
 * @param endLng End longitude
 * @param endLat End latitude
 * @param profile The routing profile (driving, walking, cycling)
 * @returns Promise with directions response
 */
export const getDirections = async (
    startLng: number,
    startLat: number,
    endLng: number,
    endLat: number,
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<DirectionsResponse> => {
    try {
        const response = await axios.get(
            `https://api.track-asia.com/directions/v5/mapbox/${profile}/${startLng},${startLat};${endLng},${endLat}`,
            {
                params: {
                    access_token: TRACKASIA_MAP_API_KEY,
                    geometries: 'geojson',
                    steps: true,
                    overview: 'full',
                    new_admin: true
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error getting directions:', error);
        throw error;
    }
};

/**
 * Search for places using autocomplete API
 * @param input Search query
 * @param bounds Optional bounding box to bias results
 * @param location Optional location to bias results
 * @param size Maximum number of results to return
 * @returns Promise with autocomplete response
 */
export const searchPlacesAutocomplete = async (
    input: string,
    bounds?: { north: number; east: number; south: number; west: number },
    location?: { lat: number; lng: number },
    size: number = 5
): Promise<AutocompleteResponse> => {
    try {
        const params: any = {
            input,
            key: TRACKASIA_MAP_API_KEY,
            size,
            new_admin: true,
            include_old_admin: true
        };

        // Thêm location nếu có
        if (location) {
            params.location = `${location.lat},${location.lng}`;
        }

        // Thêm bounds nếu có
        if (bounds) {
            params.bounds = `${bounds.south},${bounds.west};${bounds.north},${bounds.east}`;
        }

        console.log('Autocomplete API params:', params); // Debug

        const response = await axios.get(
            `https://maps.track-asia.com/api/v2/place/autocomplete/json`,
            { params }
        );

        console.log('Autocomplete API response:', response.data); // Debug

        return response.data;
    } catch (error) {
        console.error('Error searching places with autocomplete:', error);
        throw error;
    }
};

/**
 * Search for nearby places
 * @param lat Latitude
 * @param lng Longitude
 * @param radius Search radius in meters (max 50000)
 * @param type Optional place type filter
 * @returns Promise with nearby search response
 */
export const searchNearbyPlaces = async (
    lat: number,
    lng: number,
    radius: number = 1000,
    type?: string
): Promise<NearbySearchResponse> => {
    try {
        const params: any = {
            location: `${lat},${lng}`,
            radius: Math.min(radius, 50000), // Ensure radius is within API limits
            key: TRACKASIA_MAP_API_KEY,
            new_admin: true
        };

        if (type) {
            params.type = type;
        }

        const response = await axios.get(
            `https://maps.track-asia.com/api/v2/place/nearbysearch/json`,
            { params }
        );
        return response.data;
    } catch (error) {
        console.error('Error searching nearby places:', error);
        throw error;
    }
};

/**
 * Get details for a specific place
 * @param placeId The place ID
 * @returns Promise with place details response
 */
export const getPlaceDetails = async (placeId: string): Promise<PlaceDetailsResponse> => {
    try {
        const response = await axios.get(
            `https://maps.track-asia.com/api/v2/place/details/json`,
            {
                params: {
                    place_id: placeId,
                    key: TRACKASIA_MAP_API_KEY,
                    new_admin: true
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error getting place details:', error);
        throw error;
    }
};

/**
 * Reverse geocode coordinates to get an address using TrackAsia API v2
 * @param lat Latitude
 * @param lng Longitude
 * @param radius Optional search radius in meters
 * @returns Promise with reverse geocoding response
 */
export const reverseGeocodeV2 = async (
    lat: number,
    lng: number,
    radius?: number
): Promise<ReverseGeocodingResponse> => {
    try {
        const params: any = {
            latlng: `${lat},${lng}`,
            key: TRACKASIA_MAP_API_KEY,
            new_admin: true
        };

        if (radius) {
            params.radius = radius;
        }

        const response = await axios.get(
            `https://maps.track-asia.com/api/v2/geocode/json`,
            { params }
        );
        return response.data;
    } catch (error) {
        console.error('Error reverse geocoding with v2 API:', error);
        throw error;
    }
};

/**
 * Get directions between two points using TrackAsia API v2
 * @param originLat Origin latitude
 * @param originLng Origin longitude
 * @param destLat Destination latitude
 * @param destLng Destination longitude
 * @param mode Travel mode (driving, motorcycling, walking, truck)
 * @returns Promise with directions response
 */
export const getDirectionsV2 = async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    profile: string = 'driving'
): Promise<any> => {
    try {
        const response = await axios.get(`${TRACKASIA_API_BASE_URL}/route/v2/directions/json`, {
            params: {
                key: TRACKASIA_MAP_API_KEY,
                origin: `${startLat},${startLng}`,
                destination: `${endLat},${endLng}`,
                profile: profile,
                new_admin: true,
                include_old_admin: true
            }
        });

        if (response.data && response.data.status === 'OK') {
            // Đảm bảo dữ liệu có định dạng đúng
            if (response.data.routes && response.data.routes.length > 0) {
                const route = response.data.routes[0];

                // Kiểm tra và đảm bảo các trường cần thiết có sẵn
                if (!route.legs || route.legs.length === 0) {
                    console.error('No legs found in route');
                    return {
                        status: 'ERROR',
                        message: 'No legs found in route'
                    };
                }

                // Đảm bảo mỗi step có đủ thông tin
                if (route.legs[0].steps) {
                    route.legs[0].steps = route.legs[0].steps.map((step: any) => {
                        // Đảm bảo có trường maneuver
                        if (!step.maneuver) {
                            step.maneuver = '';
                        }

                        // Đảm bảo các trường distance và duration có định dạng đúng
                        if (step.distance && typeof step.distance === 'object' && step.distance.text) {
                            // Đã có định dạng đúng
                        } else if (typeof step.distance === 'number') {
                            // Chuyển đổi từ số thành đối tượng có text
                            step.distance = {
                                text: formatDistance(step.distance),
                                value: step.distance
                            };
                        }

                        if (step.duration && typeof step.duration === 'object' && step.duration.text) {
                            // Đã có định dạng đúng
                        } else if (typeof step.duration === 'number') {
                            // Chuyển đổi từ số thành đối tượng có text
                            step.duration = {
                                text: formatTime(step.duration),
                                value: step.duration
                            };
                        }

                        return step;
                    });
                }

                // Đảm bảo distance và duration của leg có định dạng đúng
                if (route.legs[0].distance && typeof route.legs[0].distance === 'number') {
                    route.legs[0].distance = {
                        text: formatDistance(route.legs[0].distance),
                        value: route.legs[0].distance
                    };
                }

                if (route.legs[0].duration && typeof route.legs[0].duration === 'number') {
                    route.legs[0].duration = {
                        text: formatTime(route.legs[0].duration),
                        value: route.legs[0].duration
                    };
                }
            }
        }

        return response.data;
    } catch (error) {
        console.error('Error getting directions:', error);
        throw error;
    }
};

/**
 * Decode a polyline string into an array of coordinates
 * @param encodedPolyline The encoded polyline string
 * @returns Array of [lat, lng] coordinates
 */
export const decodePolyline = (encodedPolyline: string): [number, number][] => {
    const points: [number, number][] = [];
    let index = 0;
    const len = encodedPolyline.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
        let b;
        let shift = 0;
        let result = 0;

        do {
            b = encodedPolyline.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;

        do {
            b = encodedPolyline.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
};

/**
 * Calculate distance between two points in kilometers
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
};

/**
 * Convert degrees to radians
 * @param deg Degrees
 * @returns Radians
 */
const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

// Format time from seconds to string
export const formatTime = (totalSeconds: number): string => {
    if (totalSeconds < 60) {
        return `${Math.round(totalSeconds)} giây`;
    } else if (totalSeconds < 3600) {
        return `${Math.round(totalSeconds / 60)} phút`;
    } else {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.round((totalSeconds % 3600) / 60);
        return `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ''}`;
    }
};

// Format distance in meters or kilometers
export const formatDistance = (distance: number): string => {
    if (distance < 1) {
        return `${Math.round(distance * 1000)} m`;
    } else if (distance < 10) {
        return `${Math.round(distance * 10) / 10} km`;
    } else {
        return `${Math.round(distance)} km`;
    }
};

// Base URL for TrackAsia API
export const TRACKASIA_API_BASE_URL = TRACKASIA_MAP_API_BASE_URL;